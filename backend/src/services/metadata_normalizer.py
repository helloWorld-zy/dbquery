from __future__ import annotations

from typing import Any


def normalize_metadata(raw: dict[str, Any]) -> dict[str, Any]:
    schemas = raw.get("schemas", [])
    tables = raw.get("tables", [])
    views = raw.get("views", [])
    columns = raw.get("columns", [])
    relationships = raw.get("relationships", [])

    schema_index: dict[str, dict[str, Any]] = {}
    for schema in schemas:
        schema_index[schema["name"]] = {
            "name": schema["name"],
            "tables": [],
            "views": [],
        }

    table_index: dict[str, dict[str, Any]] = {}
    for table in tables:
        table_item = {
            "name": table["name"],
            "comment": table.get("comment"),
            "columns": [],
        }
        schema_name = table.get("schema")
        if schema_name not in schema_index:
            schema_index[schema_name] = {"name": schema_name, "tables": [], "views": []}
        schema_index[schema_name]["tables"].append(table_item)
        table_index[f"{schema_name}.{table['name']}"] = table_item

    view_index: dict[str, dict[str, Any]] = {}
    for view in views:
        view_item = {
            "name": view["name"],
            "comment": view.get("comment"),
            "definition": view.get("definition"),
            "columns": [],
        }
        schema_name = view.get("schema")
        if schema_name not in schema_index:
            schema_index[schema_name] = {"name": schema_name, "tables": [], "views": []}
        schema_index[schema_name]["views"].append(view_item)
        view_index[f"{schema_name}.{view['name']}"] = view_item

    for column in columns:
        schema_name = column.get("schema")
        owner_name = column.get("owner")
        owner_type = column.get("owner_type")
        column_item = {
            "name": column["name"],
            "dataType": column["data_type"],
            "isNullable": column["is_nullable"],
            "defaultValue": column.get("default_value"),
            "comment": column.get("comment"),
        }
        key = f"{schema_name}.{owner_name}"
        if owner_type == "view":
            view_index.setdefault(key, {"name": owner_name, "columns": []})
            view_index[key]["columns"].append(column_item)
        else:
            table_index.setdefault(key, {"name": owner_name, "columns": []})
            table_index[key]["columns"].append(column_item)

    normalized = {
        "schemas": list(schema_index.values()),
        "relationships": relationships,
    }
    return normalized
