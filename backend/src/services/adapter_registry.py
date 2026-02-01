from __future__ import annotations

from typing import Dict

from ..adapters.base import DatabaseAdapter


class AdapterRegistry:
    def __init__(self) -> None:
        self._adapters: Dict[str, DatabaseAdapter] = {}

    def set_adapter(self, db_type: str, adapter: DatabaseAdapter) -> None:
        self._adapters[db_type] = adapter

    def get_adapter(self, db_type: str) -> DatabaseAdapter | None:
        return self._adapters.get(db_type)

    def has_adapter(self, db_type: str) -> bool:
        return db_type in self._adapters

    def reset(self) -> None:
        self._adapters = {}


_registry = AdapterRegistry()


def get_registry() -> AdapterRegistry:
    return _registry
