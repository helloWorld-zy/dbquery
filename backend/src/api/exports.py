from __future__ import annotations

from fastapi import APIRouter

from ..models.exports import ExportRequest, ExportResponse
from ..services.export_service import get_export_service
from ..utils.app_errors import AppError
from .errors import error_response

router = APIRouter()

_export_service = get_export_service()


@router.post("", response_model=ExportResponse)
def export_query(request: ExportRequest) -> ExportResponse:
    try:
        if request.format == "json":
            export_id, file_path = _export_service.export_json(request.query_id)
        else:
            export_id, file_path = _export_service.export_csv(request.query_id)
    except AppError as exc:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)

    return ExportResponse(export_id=export_id, download_url=file_path.as_posix())
