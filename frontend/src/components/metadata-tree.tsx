import { Tree } from "antd";

import type { MetadataSchema } from "../services/metadata";
import zh from "../locales/zh";

interface MetadataTreeProps {
  schemas: MetadataSchema[];
}

export default function MetadataTree({ schemas }: MetadataTreeProps) {
  const treeData = schemas.map((schema) => {
    return {
      title: schema.name,
      key: schema.name,
      children: [
        ...schema.tables.map((table) => ({
          title: `${zh.metadata.table}: ${table.name}`,
          key: `${schema.name}.table.${table.name}`,
          children: table.columns.map((col) => ({
            title: col.name,
            key: `${schema.name}.table.${table.name}.${col.name}`,
          })),
        })),
        ...schema.views.map((view) => ({
          title: `${zh.metadata.view}: ${view.name}`,
          key: `${schema.name}.view.${view.name}`,
          children: view.columns.map((col) => ({
            title: col.name,
            key: `${schema.name}.view.${view.name}.${col.name}`,
          })),
        })),
      ],
    };
  });

  return <Tree treeData={treeData} defaultExpandAll />;
}
