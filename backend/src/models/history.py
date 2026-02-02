from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    id: str
    connection_id: str
    connection_name: str
    sql_text: str
    executed_at: datetime


class HistoryListResponse(BaseModel):
    items: list[HistoryItem] = Field(default_factory=list)


class HistoryCreateRequest(BaseModel):
    connection_id: str
    connection_name: str
    sql_text: str
