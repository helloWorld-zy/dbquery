from __future__ import annotations

from typing import Iterable

from ..models.metadata import MetadataRelationship, MetadataSchema


def _format_tables(schemas: Iterable[MetadataSchema]) -> list[str]:
    entries: list[str] = []
    for schema in schemas:
        for table in schema.tables:
            cols = ", ".join(col.name for col in table.columns)
            entries.append(f"{schema.name}.{table.name} ({cols})")
        for view in schema.views:
            cols = ", ".join(col.name for col in view.columns)
            entries.append(f"{schema.name}.{view.name} [view] ({cols})")
    return entries


def build_prompt(
    question: str,
    schemas: list[MetadataSchema],
    relationships: list[MetadataRelationship],
    context_tables: list[str],
    dialect: str,
) -> str:
    table_lines = _format_tables(schemas)
    rel_lines = [
        f"{rel.source_table}({', '.join(rel.source_columns)}) -> {rel.target_table}({', '.join(rel.target_columns)})"
        for rel in relationships
    ]
    context_clause = (
        "Use only these tables/views if possible: " + ", ".join(context_tables)
        if context_tables
        else ""
    )

    return (
        "You are a SQL generator. Return ONLY one SQL query with no extra text.\n"
        f"Dialect: {dialect}.\n"
        "Only SELECT statements are allowed.\n"
        f"Question: {question}\n"
        f"{context_clause}\n"
        "Tables:\n- "
        + "\n- ".join(table_lines)
        + "\n"
        + ("Relationships:\n- " + "\n- ".join(rel_lines) + "\n" if rel_lines else "")
    )
