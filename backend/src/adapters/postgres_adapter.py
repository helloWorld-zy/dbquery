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
        engine = self._get_engine(connection_url)
        async with engine.connect() as conn:
            schemas_result = await conn.execute(
                text("SELECT schema_name FROM information_schema.schemata")
            )
            tables_result = await conn.execute(
                text(
                    "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE'"
                )
            )
            views_result = await conn.execute(
                text(
                    "SELECT table_schema, table_name FROM information_schema.views"
                )
            )
            columns_result = await conn.execute(
                text(
                    """
                    SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    """
                )
            )
            relationships_result = await conn.execute(
                text(
                    """
                    SELECT tc.constraint_name,
                           tc.table_schema,
                           tc.table_name,
                           kcu.column_name,
                           ccu.table_schema AS foreign_table_schema,
                           ccu.table_name AS foreign_table_name,
                           ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    """
                )
            )

        schemas = [{"name": row[0]} for row in schemas_result.fetchall()]
        tables = [{"schema": row[0], "name": row[1]} for row in tables_result.fetchall()]
        views = [{"schema": row[0], "name": row[1]} for row in views_result.fetchall()]
        columns = [
            {
                "schema": row[0],
                "owner": row[1],
                "owner_type": "table",
                "name": row[2],
                "data_type": row[3],
                "is_nullable": row[4] == "YES",
                "default_value": row[5],
            }
            for row in columns_result.fetchall()
        ]
        relationships = [
            {
                "name": row[0],
                "sourceTable": f"{row[1]}.{row[2]}",
                "sourceColumns": [row[3]],
                "targetTable": f"{row[4]}.{row[5]}",
                "targetColumns": [row[6]],
            }
            for row in relationships_result.fetchall()
        ]

        return {
            "schemas": schemas,
            "tables": tables,
            "views": views,
            "columns": columns,
            "relationships": relationships,
        }

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
