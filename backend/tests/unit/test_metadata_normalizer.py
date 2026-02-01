from backend.src.services.metadata_normalizer import normalize_metadata


def test_normalize_metadata_groups_tables() -> None:
    raw = {
        "schemas": [{"name": "public"}],
        "tables": [{"schema": "public", "name": "users"}],
        "views": [],
        "columns": [
            {
                "schema": "public",
                "owner": "users",
                "owner_type": "table",
                "name": "id",
                "data_type": "int",
                "is_nullable": False,
            }
        ],
        "relationships": [],
    }
    normalized = normalize_metadata(raw)
    assert normalized["schemas"][0]["tables"][0]["columns"][0]["name"] == "id"
