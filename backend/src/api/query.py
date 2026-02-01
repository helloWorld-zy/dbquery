from __future__ import annotations

from fastapi import APIRouter

from ..models.query import QueryRequest, QueryResponse
from ..services.adapter_registry import get_registry
from ..services.connection_service import get_connection_service
from ..services.export_service import get_export_service
from ..services.query_service import QueryService
from ..utils.app_errors import AppError
from .errors import error_response

router = APIRouter()

_registry = get_registry()
_connections = get_connection_service()
_service = QueryService(_registry, _connections, get_export_service())


@router.post("/{connection_id}/query", response_model=QueryResponse)
async def execute_query(connection_id: str, request: QueryRequest) -> QueryResponse:
    try:
        return await _service.execute_query(connection_id, request)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)
