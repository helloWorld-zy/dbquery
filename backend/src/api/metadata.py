from __future__ import annotations

from fastapi import APIRouter

from ..models.metadata import MetadataRefreshResponse, MetadataResponse
from ..services.adapter_registry import get_registry
from ..services.connection_service import get_connection_service
from ..services.metadata_service import MetadataService
from ..utils.app_errors import AppError
from .errors import error_response

router = APIRouter()

_registry = get_registry()
_connections = get_connection_service()
_service = MetadataService(_registry, _connections)


@router.get("/{connection_id}/metadata", response_model=MetadataResponse)
async def get_metadata(connection_id: str) -> MetadataResponse:
    try:
        return await _service.get_snapshot(connection_id)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)


@router.post("/{connection_id}/metadata/refresh", response_model=MetadataRefreshResponse, status_code=202)
async def refresh_metadata(connection_id: str) -> MetadataRefreshResponse:
    try:
        await _service.refresh_snapshot(connection_id)
        return MetadataRefreshResponse(status="refreshing", message="Refresh complete")
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)
