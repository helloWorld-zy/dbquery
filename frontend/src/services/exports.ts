import { apiFetch } from "./api";

export interface ExportRequest {
  queryId: string;
  format: "csv";
}

export interface ExportResponse {
  exportId: string;
  downloadUrl: string;
}

export function exportQuery(payload: ExportRequest): Promise<ExportResponse> {
  return apiFetch("/exports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
