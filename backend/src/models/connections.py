from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from .base import AppBaseModel

DbType = Literal["postgres", "mariadb"]
TestStatus = Literal["success", "failed", "unknown"]


class ConnectionCreate(AppBaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    db_type: DbType
    connection_url: str = Field(..., min_length=1)


class ConnectionUpdate(AppBaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    db_type: DbType | None = None
    connection_url: str | None = Field(default=None, min_length=1)


class ConnectionResponse(AppBaseModel):
    id: str
    name: str
    db_type: DbType
    created_at: datetime
    last_used_at: datetime | None = None
    last_test_status: TestStatus


class ConnectionListResponse(AppBaseModel):
    items: list[ConnectionResponse]
    total: int
    page: int
    page_size: int


class ConnectionTestResponse(AppBaseModel):
    status: Literal["success", "failed"]
    message: str | None = None
