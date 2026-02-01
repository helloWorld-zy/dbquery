from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ..models.metadata import MetadataResponse
from ..repositories.metadata_repo import create_metadata_tables
from ..repositories.sqlite import get_sqlite_connection
from ..utils.app_errors import AppError
from .adapter_registry import AdapterRegistry
from .connection_service import ConnectionService
from .metadata_normalizer import normalize_metadata


class MetadataService:
    def __init__(self, registry: AdapterRegistry, connection_service: ConnectionService) -> None:
        self._registry = registry
        self._connections = connection_service

    async def get_snapshot(self, connection_id: str) -> MetadataResponse:
        async with get_sqlite_connection() as conn:
            await create_metadata_tables(conn)
            cursor = await conn.execute(
                "SELECT id, status, refreshed_at, payload_json FROM metadata_snapshots WHERE connection_id = ? ORDER BY refreshed_at DESC LIMIT 1",
                (connection_id,),
            )
            row = await cursor.fetchone()
            if row:
                payload = json.loads(row[3]) if row[3] else {"schemas": [], "relationships": []}
                return MetadataResponse(
                    snapshot_id=row[0],
                    status=row[1],
                    refreshed_at=datetime.fromisoformat(row[2]),
                    schemas=payload.get("schemas", []),
                    relationships=payload.get("relationships", []),
                )

        return await self.refresh_snapshot(connection_id)

    async def refresh_snapshot(self, connection_id: str) -> MetadataResponse:
        record = self._connections.get_record(connection_id)
        adapter = self._registry.get_adapter(record.db_type)
        if adapter is None:
            raise AppError(code="ADAPTER_NOT_FOUND", message="No adapter for db type.")

        raw = await adapter.fetch_metadata(record.connection_url)
        normalized = normalize_metadata(raw)
        now = datetime.now(timezone.utc)
        snapshot_id = str(uuid4())

        async with get_sqlite_connection() as conn:
            await create_metadata_tables(conn)
            await conn.execute(
                "INSERT INTO metadata_snapshots (id, connection_id, refreshed_at, status, payload_json) VALUES (?, ?, ?, ?, ?)",
                (
                    snapshot_id,
                    connection_id,
                    now.isoformat(),
                    "ready",
                    json.dumps(normalized),
                ),
            )
            await conn.commit()

        return MetadataResponse(
            snapshot_id=snapshot_id,
            status="ready",
            refreshed_at=now,
            schemas=normalized.get("schemas", []),
            relationships=normalized.get("relationships", []),
        )
