from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models.history import HistoryCreateRequest, HistoryItem

# 内存存储 (MVP阶段，后续可改为数据库存储)
_history_store: dict[str, list["HistoryItem"]] = {}


def add_history(connection_id: str, request: "HistoryCreateRequest") -> "HistoryItem":
    """添加历史记录"""
    from ..models.history import HistoryItem

    item = HistoryItem(
        id=str(uuid.uuid4()),
        connection_id=request.connection_id,
        connection_name=request.connection_name,
        sql_text=request.sql_text,
        executed_at=datetime.now(timezone.utc),
    )

    if connection_id not in _history_store:
        _history_store[connection_id] = []

    _history_store[connection_id].insert(0, item)

    # 最多保留50条记录
    if len(_history_store[connection_id]) > 50:
        _history_store[connection_id] = _history_store[connection_id][:50]

    return item


def list_history(connection_id: str) -> list["HistoryItem"]:
    """获取指定连接的历史记录"""
    return _history_store.get(connection_id, [])


def clear_history(connection_id: str) -> None:
    """清空指定连接的历史记录"""
    if connection_id in _history_store:
        _history_store[connection_id] = []
