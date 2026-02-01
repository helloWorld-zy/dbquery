import { useEffect, useState } from "react";
import { Button, Card, Select, Space, message } from "antd";

import type { ConnectionResponse } from "../services/connections";
import type { MetadataRelationship, MetadataSchema } from "../services/metadata";
import type { QueryResponse } from "../services/query";
import { listConnections } from "../services/connections";
import { getMetadata, refreshMetadata } from "../services/metadata";
import { executeQuery } from "../services/query";
import MetadataTree from "../components/metadata-tree";
import RelationshipView from "../components/relationship-view";
import QueryResultsTable from "../components/query-results-table";
import SqlEditor from "../components/sql-editor";

export default function WorkspacePage() {
  const [connections, setConnections] = useState<ConnectionResponse[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sql, setSql] = useState("select 1");
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [schemas, setSchemas] = useState<MetadataSchema[]>([]);
  const [relationships, setRelationships] = useState<MetadataRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  const loadConnections = async () => {
    const response = await listConnections();
    setConnections(response.items);
    if (response.items.length && !selected) {
      setSelected(response.items[0].id);
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  const handleExecute = async () => {
    if (!selected) {
      message.warning("Select a connection first");
      return;
    }
    setLoading(true);
    try {
      const response = await executeQuery(selected, { sqlText: sql });
      setResults(response);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMetadata = async () => {
    if (!selected) {
      message.warning("Select a connection first");
      return;
    }
    setMetaLoading(true);
    try {
      await refreshMetadata(selected);
      const response = await getMetadata(selected);
      setSchemas(response.schemas);
      setRelationships(response.relationships);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setMetaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Space className="w-full" align="center">
        <Button onClick={loadConnections}>Load Connections</Button>
        <Select
          className="min-w-[240px]"
          placeholder="Select connection"
          value={selected ?? undefined}
          onChange={(value) => setSelected(value)}
          options={connections.map((item) => ({ label: item.name, value: item.id }))}
        />
        <Button type="primary" onClick={handleExecute} loading={loading}>
          Run Query
        </Button>
      </Space>

      <Card title="SQL Editor">
        <SqlEditor value={sql} onChange={setSql} />
      </Card>

      <Card
        title="Metadata"
        extra={
          <Button size="small" onClick={handleRefreshMetadata} loading={metaLoading}>
            Refresh
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MetadataTree schemas={schemas} />
          <RelationshipView relationships={relationships} />
        </div>
      </Card>

      <Card title="Results">
        {results ? (
          <QueryResultsTable columns={results.columns} rows={results.rows} />
        ) : (
          <div className="text-sm text-gray-500">No results yet.</div>
        )}
      </Card>
    </div>
  );
}
