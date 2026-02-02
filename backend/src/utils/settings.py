from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

_root_dir = Path(__file__).resolve().parents[3]
load_dotenv(dotenv_path=_root_dir / ".env")


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
    modelscope_base_url: str
    modelscope_api_key: str
    modelscope_model_name: str
    default_query_timeout_seconds: int
    default_max_rows: int
    max_max_rows: int
    metadata_cache_ttl_seconds: int
    metadata_cache_max_snapshots: int
    sqlite_path: Path


@lru_cache
def get_settings() -> Settings:
    sqlite_path = Path("./db_query/db_query.db")
    api_key = os.getenv("MODELSCOPE_API_KEY") or os.getenv("MODELSCOPE_SDK_TOKEN", "")
    return Settings(
        modelscope_base_url=os.getenv(
            "MODELSCOPE_BASE_URL", "https://api-inference.modelscope.cn/v1"
        ),
        modelscope_api_key=api_key,
        modelscope_model_name=os.getenv("MODELSCOPE_MODEL_NAME", "moonshotai/Kimi-K2.5"),
        default_query_timeout_seconds=_get_int("DEFAULT_QUERY_TIMEOUT_SECONDS", 30),
        default_max_rows=_get_int("DEFAULT_MAX_ROWS", 1000),
        max_max_rows=_get_int("MAX_MAX_ROWS", 1000),
        metadata_cache_ttl_seconds=_get_int("METADATA_CACHE_TTL_SECONDS", 300),
        metadata_cache_max_snapshots=_get_int("METADATA_CACHE_MAX_SNAPSHOTS", 5),
        sqlite_path=sqlite_path,
    )
