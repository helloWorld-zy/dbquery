from __future__ import annotations

import time
from uuid import uuid4

from ..models.query import QueryRequest, QueryResponse, QueryColumn
from ..utils.app_errors import AppError
from ..utils.settings import get_settings
from .adapter_registry import AdapterRegistry
from .connection_service import ConnectionService
from .export_service import ExportService, get_export_service
from .sql_validator import validate_select_only


class QueryService:
    def __init__(
        self,
        registry: AdapterRegistry,
        connection_service: ConnectionService,
        export_service: ExportService | None = None,
    ) -> None:
        self._registry = registry
        self._connections = connection_service
        self._exports = export_service or get_export_service()

    async def execute_query(self, connection_id: str, request: QueryRequest) -> QueryResponse:
        connection = self._connections.get_record(connection_id)
        adapter = self._registry.get_adapter(connection.db_type)
        if adapter is None:
            raise AppError(code="ADAPTER_NOT_FOUND", message="No adapter for db type.")

        settings = get_settings()
        if request.max_rows > settings.max_max_rows:
            raise AppError(code="MAX_ROWS_EXCEEDED", message="maxRows exceeds allowed maximum.")

        sql_text, limit_applied = validate_select_only(
            request.sql_text, settings.default_max_rows, adapter.dialect
        )

        if limit_applied > request.max_rows:
            raise AppError(code="LIMIT_EXCEEDS_MAX_ROWS", message="Limit exceeds maxRows.")

        start = time.perf_counter()
        result = await adapter.execute_query(
            connection.connection_url, sql_text, request.timeout_seconds, request.max_rows
        )
        duration_ms = int((time.perf_counter() - start) * 1000)

        columns = [QueryColumn(name=col["name"], type=col["type"]) for col in result["columns"]]
        rows = result["rows"]
        request_id = str(uuid4())
        self._exports.store_result(request_id, result["columns"], rows)
        return QueryResponse(
            columns=columns,
            rows=rows,
            duration_ms=duration_ms,
            limit_applied=limit_applied,
            request_id=request_id,
        )
