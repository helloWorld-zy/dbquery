from __future__ import annotations

from fastapi import APIRouter

from ..models.history import HistoryCreateRequest, HistoryListResponse
from ..services.history_service import add_history, clear_history, list_history

router = APIRouter()


@router.get("/{connection_id}/history", response_model=HistoryListResponse)
async def get_history(connection_id: str) -> HistoryListResponse:
    """获取指定连接的查询历史"""
    items = list_history(connection_id)
    return HistoryListResponse(items=items)


@router.post("/{connection_id}/history")
async def create_history(connection_id: str, request: HistoryCreateRequest) -> dict:
    """添加查询历史记录"""
    item = add_history(connection_id, request)
    return {"id": item.id, "message": "History added"}


@router.delete("/{connection_id}/history")
async def delete_history(connection_id: str) -> dict:
    """清空指定连接的查询历史"""
    clear_history(connection_id)
    return {"message": "History cleared"}
