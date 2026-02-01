from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict
from uuid import uuid4

from ..models.connections import ConnectionCreate, ConnectionResponse, ConnectionTestResponse
from ..utils.app_errors import AppError
from .adapter_registry import AdapterRegistry, get_registry


@dataclass
class ConnectionRecord:
    id: str
    name: str
    db_type: str
    connection_url: str
    created_at: datetime
    last_used_at: datetime | None
    last_test_status: str
    last_test_error: str | None

    def to_response(self) -> ConnectionResponse:
        return ConnectionResponse(
            id=self.id,
            name=self.name,
            db_type=self.db_type,
            created_at=self.created_at,
            last_used_at=self.last_used_at,
            last_test_status=self.last_test_status,
        )


class ConnectionService:
    def __init__(self, registry: AdapterRegistry) -> None:
        self._registry = registry
        self._records: Dict[str, ConnectionRecord] = {}

    def clear(self) -> None:
        self._records = {}

    def list_connections(self) -> list[ConnectionResponse]:
        return [record.to_response() for record in self._records.values()]

    def create_connection(self, data: ConnectionCreate) -> ConnectionResponse:
        for record in self._records.values():
            if record.name == data.name:
                raise AppError(code="CONNECTION_NAME_EXISTS", message="Connection name exists.")
        connection_id = str(uuid4())
        record = ConnectionRecord(
            id=connection_id,
            name=data.name,
            db_type=data.db_type,
            connection_url=data.connection_url,
            created_at=datetime.now(timezone.utc),
            last_used_at=None,
            last_test_status="unknown",
            last_test_error=None,
        )
        self._records[connection_id] = record
        return record.to_response()

    def delete_connection(self, connection_id: str) -> None:
        if connection_id not in self._records:
            raise AppError(code="NOT_FOUND", message="Connection not found.", status_code=404)
        del self._records[connection_id]

    def get_record(self, connection_id: str) -> ConnectionRecord:
        record = self._records.get(connection_id)
        if record is None:
            raise AppError(code="NOT_FOUND", message="Connection not found.", status_code=404)
        return record

    async def test_connection(self, connection_id: str) -> ConnectionTestResponse:
        record = self.get_record(connection_id)
        adapter = self._registry.get_adapter(record.db_type)
        if adapter is None:
            raise AppError(code="ADAPTER_NOT_FOUND", message="No adapter for db type.")
        try:
            await adapter.test_connection(record.connection_url)
        except Exception as exc:  # noqa: BLE001
            record.last_test_status = "failed"
            record.last_test_error = str(exc)
            return ConnectionTestResponse(status="failed", message=str(exc))
        record.last_test_status = "success"
        record.last_test_error = None
        return ConnectionTestResponse(status="success", message="Connection ok")


_service = ConnectionService(get_registry())


def get_connection_service() -> ConnectionService:
    return _service
