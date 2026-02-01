import { apiFetch } from "./api";

export interface MetadataColumn {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string | null;
  comment?: string | null;
}

export interface MetadataTable {
  name: string;
  columns: MetadataColumn[];
  comment?: string | null;
}

export interface MetadataView {
  name: string;
  columns: MetadataColumn[];
  comment?: string | null;
  definition?: string | null;
}

export interface MetadataSchema {
  name: string;
  tables: MetadataTable[];
  views: MetadataView[];
}

export interface MetadataRelationship {
  sourceTable: string;
  sourceColumns: string[];
  targetTable: string;
  targetColumns: string[];
  name?: string | null;
}

export interface MetadataResponse {
  snapshotId: string;
  status: "ready" | "refreshing" | "failed";
  refreshedAt: string;
  schemas: MetadataSchema[];
  relationships: MetadataRelationship[];
}

export interface MetadataRefreshResponse {
  status: "refreshing";
  message?: string | null;
}

export function getMetadata(connectionId: string): Promise<MetadataResponse> {
  return apiFetch(`/connections/${connectionId}/metadata`);
}

export function refreshMetadata(connectionId: string): Promise<MetadataRefreshResponse> {
  return apiFetch(`/connections/${connectionId}/metadata/refresh`, { method: "POST" });
}
