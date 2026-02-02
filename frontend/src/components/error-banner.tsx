import { Alert, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import zh from "../locales/zh";

interface ErrorBannerProps {
  error: string | null;
  onClose: () => void;
}

export default function ErrorBanner({ error, onClose }: ErrorBannerProps) {
  if (!error) {
    return null;
  }

  return (
    <Alert
      type="error"
      message={zh.error.title}
      description={error}
      className="mb-4"
      action={
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          aria-label={zh.error.close}
        />
      }
    />
  );
}
