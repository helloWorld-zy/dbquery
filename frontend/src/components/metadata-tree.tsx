import { Tree } from "antd";
import { DatabaseOutlined, TableOutlined, EyeOutlined, FieldStringOutlined } from "@ant-design/icons";

import type { MetadataSchema } from "../services/metadata";

interface MetadataTreeProps {
  schemas: MetadataSchema[];
}

export default function MetadataTree({ schemas }: MetadataTreeProps) {
  const treeData = schemas.map((schema) => {
    return {
      title: <span className="font-medium text-slate-700">{schema.name}</span>,
      key: schema.name,
      icon: <DatabaseOutlined className="text-blue-500" />,
      children: [
        ...schema.tables.map((table) => ({
          title: <span className="text-slate-600">{table.name}</span>,
          key: `${schema.name}.table.${table.name}`,
          icon: <TableOutlined className="text-cyan-600" />,
          children: table.columns.map((col) => ({
            title: <span className="text-slate-500 text-sm">{col.name} <span className="text-slate-400 text-xs ml-1">({col.dataType})</span></span>,
            key: `${schema.name}.table.${table.name}.${col.name}`,
            icon: <FieldStringOutlined className="text-slate-300" />,
            isLeaf: true,
          })),
        })),
        ...schema.views.map((view) => ({
          title: <span className="text-slate-600 italic">{view.name} (View)</span>,
          key: `${schema.name}.view.${view.name}`,
          icon: <EyeOutlined className="text-purple-500" />,
          children: view.columns.map((col) => ({
            title: <span className="text-slate-500 text-sm">{col.name}</span>,
            key: `${schema.name}.view.${view.name}.${col.name}`,
            icon: <FieldStringOutlined className="text-slate-300" />,
            isLeaf: true,
          })),
        })),
      ],
    };
  });

  return (
    <Tree 
      showIcon 
      blockNode
      treeData={treeData} 
      defaultExpandedKeys={schemas.length > 0 ? [schemas[0].name] : []}
      className="bg-transparent"
    />
  );
}
