import { List } from "antd";

import type { MetadataRelationship } from "../services/metadata";
import zh from "../locales/zh";

interface RelationshipViewProps {
  relationships: MetadataRelationship[];
}

export default function RelationshipView({ relationships }: RelationshipViewProps) {
  if (!relationships.length) {
    return <div className="text-sm text-gray-500">{zh.relationships.noRelationships}</div>;
  }

  return (
    <List
      dataSource={relationships}
      renderItem={(rel) => (
        <List.Item>
          {rel.sourceTable} ({rel.sourceColumns.join(", ")}) → {rel.targetTable} ({rel.targetColumns.join(", ")})
        </List.Item>
      )}
    />
  );
}
