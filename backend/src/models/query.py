from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import AppBaseModel


class QueryRequest(AppBaseModel):
    sql_text: str = Field(..., min_length=1)
    timeout_seconds: int = Field(30, ge=1)
    max_rows: int = Field(1000, ge=1)


class QueryColumn(AppBaseModel):
    name: str
    type: str


class QueryResponse(AppBaseModel):
    columns: list[QueryColumn]
    rows: list[list[Any]]
    duration_ms: int
    limit_applied: int
    request_id: str
