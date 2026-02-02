from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ..models.metadata import MetadataResponse
from ..repositories.metadata_repo import create_metadata_tables
from ..repositories.sqlite import get_sqlite_connection
from ..utils.app_errors import AppError
from ..utils.settings import get_settings
from .adapter_registry import AdapterRegistry
from .connection_service import ConnectionService
from .metadata_normalizer import normalize_metadata


_memory_cache: dict[str, tuple[MetadataResponse, datetime]] = {}


class MetadataService:
    def __init__(self, registry: AdapterRegistry, connection_service: ConnectionService) -> None:
        self._registry = registry
        self._connections = connection_service
        self._settings = get_settings()

    async def get_snapshot(self, connection_id: str) -> MetadataResponse:
        now = datetime.now(timezone.utc)
        cached = _memory_cache.get(connection_id)
        if cached:
            cached_response, cached_at = cached
            if (now - cached_at).total_seconds() <= self._settings.metadata_cache_ttl_seconds:
                return cached_response

        try:
            async with get_sqlite_connection() as conn:
                await create_metadata_tables(conn)
                cursor = await conn.execute(
                    "SELECT id, status, refreshed_at, payload_json FROM metadata_snapshots WHERE connection_id = ? ORDER BY refreshed_at DESC LIMIT 1",
                    (connection_id,),
                )
                row = await cursor.fetchone()
                if row:
                    payload = json.loads(row[3]) if row[3] else {"schemas": [], "relationships": []}
                    refreshed_at = datetime.fromisoformat(row[2])
                    if refreshed_at.tzinfo is None:
                        refreshed_at = refreshed_at.replace(tzinfo=timezone.utc)
                    response = MetadataResponse(
                        snapshot_id=row[0],
                        status=row[1],
                        refreshed_at=refreshed_at,
                        schemas=payload.get("schemas", []),
                        relationships=payload.get("relationships", []),
                    )
                    _memory_cache[connection_id] = (response, now)
                    return response
        except Exception as exc:
            raise AppError(
                code="METADATA_CACHE_ERROR",
                message="Failed to read metadata cache.",
                status_code=500,
                details={"error": str(exc)},
            ) from exc

        return await self.refresh_snapshot(connection_id)

    async def refresh_snapshot(self, connection_id: str) -> MetadataResponse:
        record = self._connections.get_record(connection_id)
        adapter = self._registry.get_adapter(record.db_type)
        if adapter is None:
            raise AppError(code="ADAPTER_NOT_FOUND", message="No adapter for db type.")

        try:
            raw = await adapter.fetch_metadata(record.connection_url)
        except Exception as exc:
            raise AppError(
                code="METADATA_FETCH_FAILED",
                message="Failed to fetch metadata from database.",
                status_code=500,
                details={"error": str(exc)},
            ) from exc
        normalized = normalize_metadata(raw)
        now = datetime.now(timezone.utc)
        snapshot_id = str(uuid4())

        try:
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
                await self._trim_snapshots(conn, connection_id)
                await conn.commit()
        except Exception as exc:
            raise AppError(
                code="METADATA_CACHE_ERROR",
                message="Failed to write metadata cache.",
                status_code=500,
                details={"error": str(exc)},
            ) from exc

        response = MetadataResponse(
            snapshot_id=snapshot_id,
            status="ready",
            refreshed_at=now,
            schemas=normalized.get("schemas", []),
            relationships=normalized.get("relationships", []),
        )
        _memory_cache[connection_id] = (response, now)
        return response

    async def _trim_snapshots(self, conn: Any, connection_id: str) -> None:
        max_snapshots = self._settings.metadata_cache_max_snapshots
        if max_snapshots < 1:
            return

        cursor = await conn.execute(
            "SELECT id FROM metadata_snapshots WHERE connection_id = ? ORDER BY refreshed_at DESC",
            (connection_id,),
        )
        rows = await cursor.fetchall()
        if len(rows) <= max_snapshots:
            return

        ids_to_delete = [row[0] for row in rows[max_snapshots:]]
        placeholders = ",".join("?" for _ in ids_to_delete)
        await conn.execute(
            f"DELETE FROM metadata_snapshots WHERE id IN ({placeholders})",
            ids_to_delete,
        )
