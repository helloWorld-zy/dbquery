from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from ..utils.app_errors import AppError


@dataclass
class StoredResult:
    columns: list[dict[str, Any]]
    rows: list[list[Any]]
    created_at: datetime


class ExportService:
    def __init__(self, export_dir: Path | None = None) -> None:
        self._results: dict[str, StoredResult] = {}
        self._exports: dict[str, Path] = {}
        self._export_dir = export_dir or Path("./db_query/exports")
        self._export_dir.mkdir(parents=True, exist_ok=True)

    def store_result(self, request_id: str, columns: list[dict[str, Any]], rows: list[list[Any]]) -> None:
        self._results[request_id] = StoredResult(columns=columns, rows=rows, created_at=datetime.now(timezone.utc))

    def export_csv(self, query_id: str) -> tuple[str, Path]:
        result = self._results.get(query_id)
        if result is None:
            raise AppError(code="EXPORT_NOT_FOUND", message="Query result not found.", status_code=404)

        export_id = str(uuid4())
        file_path = self._export_dir / f"export_{export_id}.csv"
        with file_path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow([col["name"] for col in result.columns])
            writer.writerows(result.rows)

        self._exports[export_id] = file_path
        return export_id, file_path

    def export_json(self, query_id: str) -> tuple[str, Path]:
        result = self._results.get(query_id)
        if result is None:
            raise AppError(code="EXPORT_NOT_FOUND", message="Query result not found.", status_code=404)

        export_id = str(uuid4())
        file_path = self._export_dir / f"export_{export_id}.json"
        columns = [col["name"] for col in result.columns]
        rows = [dict(zip(columns, row)) for row in result.rows]
        with file_path.open("w", encoding="utf-8") as file:
            json.dump(rows, file)

        self._exports[export_id] = file_path
        return export_id, file_path

    def reset(self) -> None:
        self._results = {}
        self._exports = {}


_export_service = ExportService()


def get_export_service() -> ExportService:
    return _export_service
