from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..utils.logging import configure_logging
from ..utils.request_id import RequestIdMiddleware
from .router import api_router


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(title="DB Query Tool API")
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
