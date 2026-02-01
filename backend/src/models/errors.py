from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import AppBaseModel


class ErrorDetail(AppBaseModel):
    code: str = Field(..., description="Semantic error code")
    message: str = Field(..., description="Human readable error message")
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(AppBaseModel):
    error: ErrorDetail
