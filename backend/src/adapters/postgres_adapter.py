from __future__ import annotations

import asyncio
import time

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from .base import AdapterCapabilities, DatabaseAdapter


class PostgresAdapter(DatabaseAdapter):
    def __init__(self) -> None:
        self._engine_cache: dict[str, AsyncEngine] = {}

    @property
    def dialect(self) -> str:
        return "postgres"

    @property
    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            supports_cancel=False,
            supports_metadata=True,
            supports_view_definition=True,
            supports_estimated_row_count=False,
        )

    def _to_async_url(self, connection_url: str) -> str:
        if connection_url.startswith("postgresql+asyncpg://"):
            return connection_url
        if connection_url.startswith("postgresql://"):
            return connection_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return connection_url

    def _get_engine(self, connection_url: str) -> AsyncEngine:
        async_url = self._to_async_url(connection_url)
        if async_url not in self._engine_cache:
            self._engine_cache[async_url] = create_async_engine(async_url, pool_pre_ping=True)
        return self._engine_cache[async_url]

    async def test_connection(self, connection_url: str) -> None:
        engine = self._get_engine(connection_url)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    async def fetch_metadata(self, connection_url: str) -> dict[str, object]:
        _ = connection_url
        return {"schemas": [], "relationships": []}

    async def execute_query(
        self, connection_url: str, sql: str, timeout_seconds: int, max_rows: int
    ) -> dict[str, object]:
        engine = self._get_engine(connection_url)
        async with engine.connect() as conn:
            start = time.perf_counter()
            result = await asyncio.wait_for(conn.execute(text(sql)), timeout=timeout_seconds)
            rows = result.fetchmany(max_rows)
            duration_ms = int((time.perf_counter() - start) * 1000)

        columns = [{"name": name, "type": "unknown"} for name in result.keys()]
        data_rows = [list(row) for row in rows]
        return {"columns": columns, "rows": data_rows, "duration_ms": duration_ms}

    async def cancel_query(self, query_id: str) -> bool:
        _ = query_id
        return False
