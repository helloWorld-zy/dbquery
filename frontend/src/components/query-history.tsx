import { Button, Empty, List, Typography, Space } from "antd";
import { HistoryOutlined, RedoOutlined, DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";

import zh from "../locales/zh";

export interface HistoryItem {
  id: string;
  sqlText: string;
  executedAt: string;
  connectionName: string;
}

interface QueryHistoryProps {
  items: HistoryItem[];
  onRerun: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function QueryHistory({ items, onRerun, onClear }: QueryHistoryProps) {
  if (!items.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
        <HistoryOutlined style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }} />
        <div className="text-xs">{zh.history.empty}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-200 bg-white sticky top-0 z-10 text-right">
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={onClear}>
          {zh.history.clearAll}
        </Button>
      </div>
      <List
        className="flex-1"
        itemLayout="vertical"
        dataSource={items}
        renderItem={(item) => (
          <div className="p-3 border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
            <div className="flex justify-between items-start gap-2 mb-1">
               <div className="text-xs text-slate-400 flex items-center gap-1">
                 <ClockCircleOutlined /> <span className="scale-90 origin-left">{new Date(item.executedAt).toLocaleTimeString("zh-CN")}</span>
               </div>
               <Button 
                 size="small" 
                 type="link" 
                 className="!p-0 h-auto opacity-0 group-hover:opacity-100 transition-opacity" 
                 icon={<RedoOutlined />} 
                 onClick={() => onRerun(item)}
               >
                 {zh.history.rerun}
               </Button>
            </div>
            <Typography.Paragraph
               className="text-xs font-mono text-slate-700 block break-words leading-relaxed"
               ellipsis={{ tooltip: item.sqlText, rows: 3 }}
            >
              {item.sqlText}
            </Typography.Paragraph>
          </div>
        )}
      />
    </div>
  );
}
