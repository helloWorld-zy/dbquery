from __future__ import annotations

import re

import httpx

from ..models.generate_sql import SqlGenerationRequest, SqlGenerationResponse
from ..utils.app_errors import AppError
from ..utils.settings import get_settings
from .adapter_registry import AdapterRegistry
from .connection_service import ConnectionService
from .metadata_service import MetadataService
from .modelscope_client import ModelScopeClient
from .prompt_builder import build_prompt
from .sql_validator import validate_select_only


class SqlGenerationService:
    def __init__(
        self,
        registry: AdapterRegistry,
        connection_service: ConnectionService,
        metadata_service: MetadataService,
        model_client: ModelScopeClient,
    ) -> None:
        self._registry = registry
        self._connections = connection_service
        self._metadata = metadata_service
        self._model_client = model_client

    async def generate_sql(
        self, connection_id: str, request: SqlGenerationRequest
    ) -> SqlGenerationResponse:
        record = self._connections.get_record(connection_id)
        adapter = self._registry.get_adapter(record.db_type)
        if adapter is None:
            raise AppError(code="ADAPTER_NOT_FOUND", message="No adapter for db type.")

        metadata = await self._metadata.get_snapshot(connection_id)
        prompt = build_prompt(
            request.prompt,
            metadata.schemas,
            metadata.relationships,
            request.context_tables,
            adapter.dialect,
        )
        try:
            raw_sql = await self._model_client.generate_sql(prompt)
        except httpx.HTTPStatusError as exc:
            if exc.response is not None and exc.response.status_code >= 500:
                compact_prompt = build_prompt(
                    request.prompt,
                    metadata.schemas,
                    metadata.relationships,
                    request.context_tables,
                    adapter.dialect,
                    max_tables=50,
                    max_relationships=20,
                )
                raw_sql = await self._model_client.generate_sql(compact_prompt)
            else:
                raise AppError(
                    code="MODEL_SERVICE_UNAVAILABLE",
                    message="Model service error. Check ModelScope status.",
                    status_code=502,
                    details={"error": str(exc)},
                ) from exc
        except httpx.HTTPError as exc:
            raise AppError(
                code="MODEL_SERVICE_UNAVAILABLE",
                message="Model service error. Check ModelScope status.",
                status_code=502,
                details={"error": str(exc)},
            ) from exc
        sql_text = _clean_sql(raw_sql)

        settings = get_settings()
        validated_sql, _ = validate_select_only(sql_text, settings.default_max_rows, adapter.dialect)
        return SqlGenerationResponse(sql_text=validated_sql)


def _clean_sql(raw_sql: str) -> str:
    cleaned = raw_sql.strip()
    cleaned = re.sub(r"^```sql\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()
    return cleaned
