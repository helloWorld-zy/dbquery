import { Button, Space, message } from "antd";

import { exportQuery } from "../services/exports";
import zh from "../locales/zh";

interface ExportControlsProps {
  queryId: string | null;
}

export default function ExportControls({ queryId }: ExportControlsProps) {
  const handleExport = async () => {
    if (!queryId) {
      message.warning(zh.export.noResults);
      return;
    }
    try {
      const response = await exportQuery({ queryId, format: "csv" });
      message.success(`${zh.export.ready}: ${response.downloadUrl}`);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Space>
      <Button onClick={handleExport} disabled={!queryId}>
        {zh.export.csv}
      </Button>
    </Space>
  );
}
