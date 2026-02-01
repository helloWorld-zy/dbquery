from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AdapterCapabilities:
    supports_cancel: bool
    supports_metadata: bool
    supports_view_definition: bool
    supports_estimated_row_count: bool


class DatabaseAdapter(ABC):
    @property
    @abstractmethod
    def dialect(self) -> str:
        raise NotImplementedError

    @property
    @abstractmethod
    def capabilities(self) -> AdapterCapabilities:
        raise NotImplementedError

    @abstractmethod
    async def test_connection(self, connection_url: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def fetch_metadata(self, connection_url: str) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def execute_query(
        self, connection_url: str, sql: str, timeout_seconds: int, max_rows: int
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def cancel_query(self, query_id: str) -> bool:
        raise NotImplementedError
