import { apiFetch } from "./api";

export interface QueryRequest {
  sqlText: string;
  timeoutSeconds?: number;
  maxRows?: number;
}

export interface QueryColumn {
  name: string;
  type: string;
}

export interface QueryResponse {
  columns: QueryColumn[];
  rows: unknown[][];
  durationMs: number;
  limitApplied: number;
  requestId: string;
}

export function executeQuery(connectionId: string, payload: QueryRequest): Promise<QueryResponse> {
  return apiFetch(`/connections/${connectionId}/query`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
