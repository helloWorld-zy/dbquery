import { Button, Space, message } from "antd";

import { exportQuery } from "../services/exports";

interface ExportControlsProps {
  queryId: string | null;
}

export default function ExportControls({ queryId }: ExportControlsProps) {
  const handleExport = async () => {
    if (!queryId) {
      message.warning("No query results to export");
      return;
    }
    try {
      const response = await exportQuery({ queryId, format: "csv" });
      message.success(`Export ready: ${response.downloadUrl}`);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Space>
      <Button onClick={handleExport} disabled={!queryId}>
        Export CSV
      </Button>
    </Space>
  );
}
