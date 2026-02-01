from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AppError(Exception):
    code: str
    message: str
    status_code: int = 400
    details: dict[str, object] | None = None

    def __str__(self) -> str:
        return f"{self.code}: {self.message}"
