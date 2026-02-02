from __future__ import annotations

from typing import Literal

from .base import AppBaseModel


class ExportRequest(AppBaseModel):
    query_id: str
    format: Literal["csv", "json"]


class ExportResponse(AppBaseModel):
    export_id: str
    download_url: str
