import { Button, Select, Space, message } from "antd";

import type { ExportRequest } from "../services/exports";
import zh from "../locales/zh";

interface ExportControlsProps {
  queryId: string | null;
  format: ExportRequest["format"];
  onFormatChange: (format: ExportRequest["format"]) => void;
  onExport: () => Promise<void>;
}

export default function ExportControls({ queryId, format, onFormatChange, onExport }: ExportControlsProps) {
  const handleExport = async () => {
    if (!queryId) {
      message.warning(zh.export.noResults);
      return;
    }
    await onExport();
  };

  return (
    <Space>
      <Select
        size="small"
        value={format}
        onChange={onFormatChange}
        options={[
          { label: zh.export.csv, value: "csv" },
          { label: zh.export.json, value: "json" },
        ]}
      />
      <Button onClick={handleExport} disabled={!queryId}>
        {zh.export.export}
      </Button>
    </Space>
  );
}
