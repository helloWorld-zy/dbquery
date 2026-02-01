from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import aiosqlite

from ..utils.settings import get_settings


def ensure_sqlite_path(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def get_sqlite_connection() -> AsyncIterator[aiosqlite.Connection]:
    settings = get_settings()
    ensure_sqlite_path(settings.sqlite_path)
    connection = await aiosqlite.connect(settings.sqlite_path.as_posix())
    try:
        await connection.execute("PRAGMA foreign_keys = ON;")
        yield connection
    finally:
        await connection.close()
