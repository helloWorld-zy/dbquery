from __future__ import annotations

from fastapi.responses import JSONResponse

from ..models.errors import ErrorDetail, ErrorResponse


def error_response(status_code: int, code: str, message: str, details: dict[str, object] | None = None) -> JSONResponse:
    payload = ErrorResponse(error=ErrorDetail(code=code, message=message, details=details or {}))
    return JSONResponse(status_code=status_code, content=payload.to_dict())
