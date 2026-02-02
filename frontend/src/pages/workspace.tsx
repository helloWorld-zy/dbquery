import { useEffect, useState } from "react";
import { Button, Card, Select, Space, message } from "antd";

import type { ConnectionResponse } from "../services/connections";
import type { MetadataRelationship, MetadataSchema } from "../services/metadata";
import type { QueryResponse } from "../services/query";
import type { HistoryItem } from "../components/query-history";
import { listConnections } from "../services/connections";
import { getMetadata, refreshMetadata } from "../services/metadata";
import { executeQuery } from "../services/query";
import { addHistory, clearHistory, listHistory } from "../services/history";
import MetadataTree from "../components/metadata-tree";
import Nl2SqlPanel from "../components/nl2sql-panel";
import ExportControls from "../components/export-controls";
import RelationshipView from "../components/relationship-view";
import QueryResultsTable from "../components/query-results-table";
import SqlEditor from "../components/sql-editor";
import ErrorBanner from "../components/error-banner";
import QueryHistory from "../components/query-history";
import zh from "../locales/zh";

export default function WorkspacePage() {
  const [connections, setConnections] = useState<ConnectionResponse[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sql, setSql] = useState("select 1");
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [schemas, setSchemas] = useState<MetadataSchema[]>([]);
  const [relationships, setRelationships] = useState<MetadataRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadConnections = async () => {
    const response = await listConnections();
    setConnections(response.items);
    if (response.items.length && !selected) {
      setSelected(response.items[0].id);
    }
  };

  const loadHistory = async () => {
    if (!selected) return;
    try {
      const response = await listHistory(selected);
      setHistory(response.items);
    } catch {
      // 忽略历史加载错误
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [selected]);

  const handleExecute = async () => {
    if (!selected) {
      message.warning(zh.workspace.selectConnectionFirst);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await executeQuery(selected, { sqlText: sql });
      setResults(response);
      // 添加到历史记录
      const conn = connections.find((c) => c.id === selected);
      if (conn) {
        await addHistory(selected, {
          connectionId: selected,
          connectionName: conn.name,
          sqlText: sql,
        });
        await loadHistory();
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMetadata = async () => {
    if (!selected) {
      message.warning(zh.workspace.selectConnectionFirst);
      return;
    }
    setMetaLoading(true);
    setError(null);
    try {
      await refreshMetadata(selected);
      const response = await getMetadata(selected);
      setSchemas(response.schemas);
      setRelationships(response.relationships);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setMetaLoading(false);
    }
  };

  const handleHistoryRerun = (item: HistoryItem) => {
    setSql(item.sqlText);
  };

  const handleClearHistory = async () => {
    if (!selected) return;
    try {
      await clearHistory(selected);
      setHistory([]);
      message.success(zh.history.cleared);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-4 px-2 py-4">
      <ErrorBanner error={error} onClose={() => setError(null)} />

      <Space className="w-full" align="center">
        <Button onClick={loadConnections}>{zh.workspace.loadConnections}</Button>
        <Select
          className="min-w-[240px]"
          placeholder={zh.workspace.selectConnection}
          value={selected ?? undefined}
          onChange={(value) => setSelected(value)}
          options={connections.map((item) => ({ label: item.name, value: item.id }))}
        />
        <Button type="primary" onClick={handleExecute} loading={loading}>
          {zh.workspace.runQuery}
        </Button>
      </Space>

      <Card title={zh.workspace.sqlEditor} className="rounded-2xl border-white/70 bg-white/70 shadow-lg backdrop-blur">
        <SqlEditor value={sql} onChange={setSql} />
      </Card>

      <Card
        title={zh.workspace.metadata}
        className="rounded-2xl border-white/70 bg-white/70 shadow-lg backdrop-blur"
        extra={
          <Button size="small" onClick={handleRefreshMetadata} loading={metaLoading}>
            {zh.workspace.refresh}
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MetadataTree schemas={schemas} />
          <RelationshipView relationships={relationships} />
        </div>
      </Card>

      <Card title={zh.workspace.results} className="rounded-2xl border-white/70 bg-white/70 shadow-lg backdrop-blur">
        <div className="space-y-3">
          <ExportControls queryId={results?.requestId ?? null} />
          {results ? (
            <QueryResultsTable columns={results.columns} rows={results.rows} />
          ) : (
            <div className="text-sm text-gray-500">{zh.workspace.noResults}</div>
          )}
        </div>
      </Card>

      <Card title={zh.workspace.nl2sql} className="rounded-2xl border-white/70 bg-white/70 shadow-lg backdrop-blur">
        <Nl2SqlPanel connectionId={selected} onGenerated={setSql} />
      </Card>

      <Card title={zh.history.title} className="rounded-2xl border-white/70 bg-white/70 shadow-lg backdrop-blur">
        <QueryHistory items={history} onRerun={handleHistoryRerun} onClear={handleClearHistory} />
      </Card>
    </div>
  );
}
