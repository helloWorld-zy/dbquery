import { apiFetch } from "./api";

export interface ConnectionCreate {
  name: string;
  dbType: "postgres" | "mariadb";
  connectionUrl: string;
}

export interface ConnectionUpdate {
  name?: string;
  dbType?: "postgres" | "mariadb";
  connectionUrl?: string;
}

export interface ConnectionResponse {
  id: string;
  name: string;
  dbType: "postgres" | "mariadb";
  createdAt: string;
  lastUsedAt?: string | null;
  lastTestStatus: "success" | "failed" | "unknown";
}

export interface ConnectionListResponse {
  items: ConnectionResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ConnectionTestResponse {
  status: "success" | "failed";
  message?: string | null;
}

export function listConnections(): Promise<ConnectionListResponse> {
  return apiFetch("/connections");
}

export function createConnection(payload: ConnectionCreate): Promise<ConnectionResponse> {
  return apiFetch("/connections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteConnection(connectionId: string): Promise<void> {
  return apiFetch(`/connections/${connectionId}`, { method: "DELETE" });
}

export function updateConnection(
  connectionId: string,
  payload: ConnectionUpdate
): Promise<ConnectionResponse> {
  return apiFetch(`/connections/${connectionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function testConnection(connectionId: string): Promise<ConnectionTestResponse> {
  return apiFetch(`/connections/${connectionId}/test`, { method: "POST" });
}
