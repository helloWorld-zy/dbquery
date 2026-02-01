from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _get_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise ValueError(f"Invalid int for {name}: {raw}") from exc


@dataclass(frozen=True)
class Settings:
    ollama_base_url: str
    ollama_model_name: str
    default_query_timeout_seconds: int
    default_max_rows: int
    max_max_rows: int
    sqlite_path: Path


@lru_cache
def get_settings() -> Settings:
    sqlite_path = Path("./db_query/db_query.db")
    return Settings(
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model_name=os.getenv("OLLAMA_MODEL_NAME", "llama3"),
        default_query_timeout_seconds=_get_int("DEFAULT_QUERY_TIMEOUT_SECONDS", 30),
        default_max_rows=_get_int("DEFAULT_MAX_ROWS", 1000),
        max_max_rows=_get_int("MAX_MAX_ROWS", 1000),
        sqlite_path=sqlite_path,
    )
