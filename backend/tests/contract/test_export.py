from fastapi.testclient import TestClient

from backend.src.api.app import create_app
from backend.src.adapters.base import AdapterCapabilities, DatabaseAdapter
from backend.src.services.adapter_registry import get_registry
from backend.src.services.connection_service import get_connection_service
from backend.src.services.export_service import get_export_service


class FakeAdapter(DatabaseAdapter):
    @property
    def dialect(self) -> str:
        return "postgres"

    @property
    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(False, False, False, False)

    async def test_connection(self, connection_url: str) -> None:
        _ = connection_url

    async def fetch_metadata(self, connection_url: str) -> dict[str, object]:
        return {"schemas": [], "relationships": []}

    async def execute_query(
        self, connection_url: str, sql: str, timeout_seconds: int, max_rows: int
    ) -> dict[str, object]:
        return {"columns": [{"name": "value", "type": "int"}], "rows": [[1]]}

    async def cancel_query(self, query_id: str) -> bool:
        return False


def test_export_contract() -> None:
    registry = get_registry()
    registry.reset()
    registry.set_adapter("postgres", FakeAdapter())
    get_connection_service().clear()
    get_export_service().reset()

    client = TestClient(create_app())
    payload = {"name": "Local", "dbType": "postgres", "connectionUrl": "postgresql://db"}
    response = client.post("/api/v1/connections", json=payload)
    connection_id = response.json()["id"]

    query_response = client.post(
        f"/api/v1/connections/{connection_id}/query",
        json={"sqlText": "select 1", "timeoutSeconds": 30, "maxRows": 1000},
    )
    query_id = query_response.json()["requestId"]

    export_response = client.post("/api/v1/exports", json={"queryId": query_id, "format": "csv"})
    assert export_response.status_code == 200
    assert export_response.json()["exportId"]
