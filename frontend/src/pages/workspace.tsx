import { useEffect, useState } from "react";
import { Button, Card, Select, Space, message, Layout, Tabs, Empty, Tooltip } from "antd";
import { 
  PlayCircleOutlined, 
  ReloadOutlined, 
  DatabaseOutlined, 
  HistoryOutlined, 
  TableOutlined, 
  ApartmentOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  SyncOutlined
} from "@ant-design/icons";

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

const { Sider, Content } = Layout;

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
  const [activeResultTab, setActiveResultTab] = useState("results");

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
      setActiveResultTab("results");
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
      message.success("元数据已更新");
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
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-500">
      <ErrorBanner error={error} onClose={() => setError(null)} />

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 flex items-center gap-3">
            <Select
            className="w-64"
            size="large"
            placeholder={zh.workspace.selectConnection}
            value={selected ?? undefined}
            onChange={(value) => setSelected(value)}
            options={connections.map((item) => ({ 
                label: <span className="font-medium">{item.name}</span>, 
                value: item.id 
            }))}
            suffixIcon={<DatabaseOutlined className="text-slate-400" />}
            />
            <Tooltip title="刷新连接列表">
                <Button icon={<ReloadOutlined />} onClick={loadConnections} />
            </Tooltip>
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />} 
                onClick={handleExecute} 
                loading={loading}
                className="bg-blue-600 shadow-md shadow-blue-100"
            >
            {zh.workspace.runQuery}
            </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
           <Card 
             className="flex-1 flex flex-col shadow-sm border-slate-200 overflow-hidden" 
             bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
           >
             <Tabs 
               defaultActiveKey="metadata" 
               className="h-full custom-sidebar-tabs"
               tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
               items={[
                {
                    key: "metadata",
                    label: <span><DatabaseOutlined /> 对象</span>,
                    children: (
                        <div className="flex flex-col h-full bg-slate-50">
                            <div className="p-2 border-b border-slate-200 bg-white sticky top-0 z-10 text-right">
                                <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<SyncOutlined spin={metaLoading} />} 
                                    onClick={handleRefreshMetadata}
                                    disabled={!selected}
                                >
                                    刷新
                                </Button>
                            </div>
                            <div className="flex-1 overflow-auto p-2">
                                {schemas.length > 0 ? (
                                    <MetadataTree schemas={schemas} />
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        <DatabaseOutlined className="text-2xl mb-2" />
                                        <div className="text-xs">暂无元数据，请刷新</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                },
                {
                    key: "history",
                    label: <span><HistoryOutlined /> 历史</span>,
                    children: (
                        <div className="h-full overflow-auto bg-slate-50">
                            <QueryHistory items={history} onRerun={handleHistoryRerun} onClear={handleClearHistory} />
                        </div>
                    )
                }
               ]}
             />
           </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
            {/* Top Area: NL2SQL & Editor */}
            <div className="flex-none space-y-4">
                <Card 
                   className="shadow-sm border-slate-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"
                   bodyStyle={{ padding: '16px' }}
                >
                    <div className="flex items-center gap-2 mb-3 text-blue-800 font-medium">
                        <ThunderboltOutlined /> <span className="font-['Newsreader'] italic">AI Assistant</span>
                    </div>
                    <Nl2SqlPanel connectionId={selected} onGenerated={setSql} />
                </Card>

                <Card 
                  title={<Space><CodeOutlined /> {zh.workspace.sqlEditor}</Space>}
                  className="shadow-sm border-slate-200"
                  bodyStyle={{ padding: 0 }}
                >
                    <SqlEditor value={sql} onChange={setSql} />
                </Card>
            </div>
            
            {/* Bottom Area: Results & Relationships */}
            <Card 
              className="flex-1 shadow-sm border-slate-200 flex flex-col overflow-hidden"
              bodyStyle={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              headStyle={{ minHeight: '48px' }}
            >
                <Tabs 
                    activeKey={activeResultTab}
                    onChange={setActiveResultTab}
                    tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
                    items={[
                        {
                            key: "results",
                            label: <span><TableOutlined /> {zh.workspace.results}</span>,
                            children: (
                                <div className="h-full flex flex-col">
                                    <div className="p-2 border-b border-slate-100 flex justify-end">
                                        <ExportControls queryId={results?.requestId ?? null} />
                                    </div>
                                    <div className="flex-1 overflow-auto p-4">
                                        {results ? (
                                            <QueryResultsTable columns={results.columns} rows={results.rows} />
                                        ) : (
                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={zh.workspace.noResults} />
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "relationships",
                            label: <span><ApartmentOutlined /> 模型关系</span>,
                            children: (
                                <div className="h-full overflow-auto p-4">
                                    <RelationshipView relationships={relationships} />
                                </div>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
      </div>
    </div>
  );
}
