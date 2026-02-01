import pytest
from fastapi.testclient import TestClient

from backend.src.api.app import create_app
from backend.src.adapters.base import AdapterCapabilities, DatabaseAdapter
from backend.src.services.adapter_registry import get_registry
from backend.src.services.connection_service import get_connection_service
from backend.src.services.metadata_service import MetadataService
from backend.src.services.sql_generation_service import SqlGenerationService
from backend.src.services.ollama_client import OllamaClient
from backend.src.services.prompt_builder import build_prompt


class FakeAdapter(DatabaseAdapter):
    @property
    def dialect(self) -> str:
        return "postgres"

    @property
    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(False, True, False, False)

    async def test_connection(self, connection_url: str) -> None:
        _ = connection_url

    async def fetch_metadata(self, connection_url: str) -> dict[str, object]:
        _ = connection_url
        return {
            "schemas": [{"name": "public"}],
            "tables": [{"schema": "public", "name": "users"}],
            "views": [],
            "columns": [],
            "relationships": [],
        }

    async def execute_query(
        self, connection_url: str, sql: str, timeout_seconds: int, max_rows: int
    ) -> dict[str, object]:
        return {"columns": [{"name": "value", "type": "int"}], "rows": [[1]]}

    async def cancel_query(self, query_id: str) -> bool:
        return False


class FakeOllama(OllamaClient):
    async def generate_sql(self, prompt: str) -> str:
        assert "Only SELECT" in prompt
        return "select * from users"


def test_generate_sql_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    registry = get_registry()
    registry.reset()
    registry.set_adapter("postgres", FakeAdapter())
    get_connection_service().clear()

    client = TestClient(create_app())
    payload = {"name": "Local", "dbType": "postgres", "connectionUrl": "postgresql://db"}
    response = client.post("/api/v1/connections", json=payload)
    connection_id = response.json()["id"]

    metadata_service = MetadataService(registry, get_connection_service())
    service = SqlGenerationService(registry, get_connection_service(), metadata_service, FakeOllama())

    monkeypatch.setattr(
        "backend.src.api.generate_sql._service",
        service,
        raising=False,
    )

    gen_response = client.post(
        f"/api/v1/connections/{connection_id}/generate-sql",
        json={"prompt": "list users"},
    )
    assert gen_response.status_code == 200
    assert "select" in gen_response.json()["sqlText"].lower()
