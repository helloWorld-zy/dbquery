from __future__ import annotations

import aiosqlite


async def create_history_tables(connection: aiosqlite.Connection) -> None:
    await connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS query_history (
            id TEXT PRIMARY KEY,
            connection_id TEXT NOT NULL,
            sql_text TEXT NOT NULL,
            source TEXT NOT NULL,
            started_at TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            row_count INTEGER NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT
        );

        CREATE TABLE IF NOT EXISTS export_artifacts (
            id TEXT PRIMARY KEY,
            query_history_id TEXT NOT NULL,
            format TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT,
            FOREIGN KEY(query_history_id) REFERENCES query_history(id) ON DELETE CASCADE
        );
        """
    )
    await connection.commit()
