import { Table } from "antd";

import type { QueryColumn } from "../services/query";

interface QueryResultsTableProps {
  columns: QueryColumn[];
  rows: unknown[][];
}

export default function QueryResultsTable({ columns, rows }: QueryResultsTableProps) {
  const tableColumns = columns.map((col, index) => ({
    title: col.name,
    dataIndex: index,
    key: col.name,
  }));

  const dataSource = rows.map((row, idx) => {
    return { key: idx, ...Object.fromEntries(row.map((value, index) => [index, value])) };
  });

  return <Table columns={tableColumns} dataSource={dataSource} pagination={false} />;
}
