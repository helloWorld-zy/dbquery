from __future__ import annotations

from pydantic import Field

from .base import AppBaseModel


class SqlGenerationRequest(AppBaseModel):
    prompt: str = Field(..., min_length=1)
    context_tables: list[str] = Field(default_factory=list)


class SqlGenerationResponse(AppBaseModel):
    sql_text: str
