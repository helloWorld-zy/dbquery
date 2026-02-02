import { Button, Empty, List, Typography } from "antd";
import { HistoryOutlined, RedoOutlined, DeleteOutlined } from "@ant-design/icons";

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
      <Empty
        image={<HistoryOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
        description={zh.history.empty}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography.Title level={5} className="!mb-0">
          {zh.history.title}
        </Typography.Title>
        <Button size="small" icon={<DeleteOutlined />} onClick={onClear} danger>
          {zh.history.clearAll}
        </Button>
      </div>
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                key="rerun"
                size="small"
                icon={<RedoOutlined />}
                onClick={() => onRerun(item)}
              >
                {zh.history.rerun}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Typography.Text code className="text-xs">
                  {item.sqlText.length > 80 ? `${item.sqlText.slice(0, 80)}...` : item.sqlText}
                </Typography.Text>
              }
              description={`${item.connectionName} · ${new Date(item.executedAt).toLocaleString("zh-CN")}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
