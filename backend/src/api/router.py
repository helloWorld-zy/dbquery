from __future__ import annotations

from fastapi import APIRouter

from . import connections, exports, generate_sql, history, metadata, query

api_router = APIRouter()

api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
api_router.include_router(query.router, prefix="/connections", tags=["query"])
api_router.include_router(metadata.router, prefix="/connections", tags=["metadata"])
api_router.include_router(generate_sql.router, prefix="/connections", tags=["generate-sql"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
api_router.include_router(history.router, prefix="/connections", tags=["history"])
