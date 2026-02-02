import { Button, Input, Space, message } from "antd";
import { useState } from "react";

import { generateSql } from "../services/generate_sql";
import zh from "../locales/zh";

interface Nl2SqlPanelProps {
  connectionId: string | null;
  onGenerated: (sqlText: string) => void;
}

export default function Nl2SqlPanel({ connectionId, onGenerated }: Nl2SqlPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!connectionId) {
      return;
    }
    setLoading(true);
    try {
      const response = await generateSql(connectionId, { prompt });
      onGenerated(response.sqlText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : zh.nl2sql.error;
      message.error(errorMessage || zh.nl2sql.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      <Input.TextArea
        rows={3}
        placeholder={zh.nl2sql.placeholder}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <Button type="primary" onClick={handleGenerate} loading={loading} disabled={!prompt}>
        {zh.nl2sql.generate}
      </Button>
    </Space>
  );
}
