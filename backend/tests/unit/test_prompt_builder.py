from backend.src.services.prompt_builder import build_prompt
from backend.src.models.metadata import MetadataColumn, MetadataRelationship, MetadataSchema, MetadataTable


def test_prompt_builder_includes_tables() -> None:
    schemas = [
        MetadataSchema(
            name="public",
            tables=[MetadataTable(name="users", columns=[MetadataColumn(name="id", data_type="int", is_nullable=False)])],
            views=[],
        )
    ]
    prompt = build_prompt(
        question="list users",
        schemas=schemas,
        relationships=[
            MetadataRelationship(
                source_table="public.users",
                source_columns=["id"],
                target_table="public.orders",
                target_columns=["user_id"],
            )
        ],
        context_tables=[],
        dialect="postgres",
    )
    assert "public.users" in prompt
    assert "Dialect: postgres" in prompt
