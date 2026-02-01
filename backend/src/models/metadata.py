from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from .base import AppBaseModel


class MetadataColumn(AppBaseModel):
    name: str
    data_type: str
    is_nullable: bool
    default_value: str | None = None
    comment: str | None = None


class MetadataTable(AppBaseModel):
    name: str
    columns: list[MetadataColumn]
    comment: str | None = None


class MetadataView(AppBaseModel):
    name: str
    columns: list[MetadataColumn]
    comment: str | None = None
    definition: str | None = None


class MetadataSchema(AppBaseModel):
    name: str
    tables: list[MetadataTable] = Field(default_factory=list)
    views: list[MetadataView] = Field(default_factory=list)


class MetadataRelationship(AppBaseModel):
    source_table: str
    source_columns: list[str]
    target_table: str
    target_columns: list[str]
    name: str | None = None


class MetadataResponse(AppBaseModel):
    snapshot_id: str
    status: Literal["ready", "refreshing", "failed"]
    refreshed_at: datetime
    schemas: list[MetadataSchema]
    relationships: list[MetadataRelationship]


class MetadataRefreshResponse(AppBaseModel):
    status: Literal["refreshing"]
    message: str | None = None
