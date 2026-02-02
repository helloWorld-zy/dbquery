from __future__ import annotations

from fastapi import APIRouter

from ..models.connections import (
    ConnectionCreate,
    ConnectionListResponse,
    ConnectionResponse,
    ConnectionUpdate,
)
from ..models.connections import ConnectionTestResponse
from ..services.adapter_registry import get_registry
from ..services.connection_service import get_connection_service
from ..utils.app_errors import AppError
from .errors import error_response

router = APIRouter()

_registry = get_registry()
_service = get_connection_service()


@router.get("", response_model=ConnectionListResponse)
def list_connections() -> ConnectionListResponse:
    items = _service.list_connections()
    return ConnectionListResponse(items=items, total=len(items), page=1, page_size=len(items))


@router.post("", response_model=ConnectionResponse)
def create_connection(request: ConnectionCreate) -> ConnectionResponse:
    try:
        return _service.create_connection(request)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)


@router.delete("/{connection_id}", status_code=204)
def delete_connection(connection_id: str) -> None:
    try:
        _service.delete_connection(connection_id)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)


@router.put("/{connection_id}", response_model=ConnectionResponse)
def update_connection(connection_id: str, request: ConnectionUpdate) -> ConnectionResponse:
    try:
        return _service.update_connection(connection_id, request)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)


@router.post("/{connection_id}/test", response_model=ConnectionTestResponse)
async def test_connection(connection_id: str) -> ConnectionTestResponse:
    try:
        return await _service.test_connection(connection_id)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)
