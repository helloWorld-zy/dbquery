from __future__ import annotations

from fastapi import APIRouter

from ..models.generate_sql import SqlGenerationRequest, SqlGenerationResponse
from ..services.adapter_registry import get_registry
from ..services.connection_service import get_connection_service
from ..services.metadata_service import MetadataService
from ..services.modelscope_client import ModelScopeClient
from ..services.sql_generation_service import SqlGenerationService
from ..utils.app_errors import AppError
from .errors import error_response

router = APIRouter()

_registry = get_registry()
_connections = get_connection_service()
_metadata = MetadataService(_registry, _connections)
_service = SqlGenerationService(_registry, _connections, _metadata, ModelScopeClient())


@router.post("/{connection_id}/generate-sql", response_model=SqlGenerationResponse)
async def generate_sql(
    connection_id: str, request: SqlGenerationRequest
) -> SqlGenerationResponse:
    try:
        return await _service.generate_sql(connection_id, request)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)
