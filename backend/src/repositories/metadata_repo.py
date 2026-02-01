from __future__ import annotations

import aiosqlite


async def create_metadata_tables(connection: aiosqlite.Connection) -> None:
    await connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS metadata_snapshots (
            id TEXT PRIMARY KEY,
            connection_id TEXT NOT NULL,
            captured_at TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT,
            schema_count INTEGER NOT NULL DEFAULT 0,
            table_count INTEGER NOT NULL DEFAULT 0,
            view_count INTEGER NOT NULL DEFAULT 0,
            relationship_count INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS schemas (
            id TEXT PRIMARY KEY,
            snapshot_id TEXT NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY(snapshot_id) REFERENCES metadata_snapshots(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tables (
            id TEXT PRIMARY KEY,
            schema_id TEXT NOT NULL,
            name TEXT NOT NULL,
            comment TEXT,
            FOREIGN KEY(schema_id) REFERENCES schemas(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS views (
            id TEXT PRIMARY KEY,
            schema_id TEXT NOT NULL,
            name TEXT NOT NULL,
            definition TEXT,
            comment TEXT,
            FOREIGN KEY(schema_id) REFERENCES schemas(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS columns (
            id TEXT PRIMARY KEY,
            owner_type TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            name TEXT NOT NULL,
            data_type TEXT NOT NULL,
            is_nullable INTEGER NOT NULL,
            default_value TEXT,
            ordinal_position INTEGER NOT NULL,
            comment TEXT
        );

        CREATE TABLE IF NOT EXISTS relationships (
            id TEXT PRIMARY KEY,
            snapshot_id TEXT NOT NULL,
            source_table_id TEXT NOT NULL,
            source_columns TEXT NOT NULL,
            target_table_id TEXT NOT NULL,
            target_columns TEXT NOT NULL,
            name TEXT,
            FOREIGN KEY(snapshot_id) REFERENCES metadata_snapshots(id) ON DELETE CASCADE
        );
        """
    )
    await connection.commit()
