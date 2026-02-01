import Editor from "@monaco-editor/react";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SqlEditor({ value, onChange }: SqlEditorProps) {
  return (
    <Editor
      height="260px"
      defaultLanguage="sql"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      options={{ minimap: { enabled: false } }}
    />
  );
}
