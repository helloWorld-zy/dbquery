from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..adapters.mariadb_adapter import MariaDbAdapter
from ..adapters.postgres_adapter import PostgresAdapter
from ..services.adapter_registry import get_registry
from ..utils.logging import configure_logging
from ..utils.request_id import RequestIdMiddleware
from .router import api_router


def create_app() -> FastAPI:
    configure_logging()
    registry = get_registry()
    if not registry.has_adapter("postgres"):
        registry.set_adapter("postgres", PostgresAdapter())
    if not registry.has_adapter("mariadb"):
        registry.set_adapter("mariadb", MariaDbAdapter())
    app = FastAPI(title="DB Query Tool API")
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
