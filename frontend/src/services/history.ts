import type { HistoryItem } from "../components/query-history";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8001/api/v1";

export interface HistoryListResponse {
  items: HistoryItem[];
}

export async function listHistory(connectionId: string): Promise<HistoryListResponse> {
  const response = await fetch(`${API}/connections/${connectionId}/history`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to fetch history");
  }
  return response.json();
}

export async function addHistory(
  connectionId: string,
  data: { connectionId: string; connectionName: string; sqlText: string }
): Promise<void> {
  const response = await fetch(`${API}/connections/${connectionId}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      connection_id: data.connectionId,
      connection_name: data.connectionName,
      sql_text: data.sqlText,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to add history");
  }
}

export async function clearHistory(connectionId: string): Promise<void> {
  const response = await fetch(`${API}/connections/${connectionId}/history`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to clear history");
  }
}
