import { apiFetch } from "./api";

export interface SqlGenerationRequest {
  prompt: string;
  contextTables?: string[];
}

export interface SqlGenerationResponse {
  sqlText: string;
}

export function generateSql(connectionId: string, payload: SqlGenerationRequest): Promise<SqlGenerationResponse> {
  return apiFetch(`/connections/${connectionId}/generate-sql`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
