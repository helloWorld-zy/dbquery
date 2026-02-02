import { Tabs } from "antd";

import ConnectionsPage from "./pages/connections";
import WorkspacePage from "./pages/workspace";
import zh from "./locales/zh";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-cyan-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{zh.app.title}</h1>
        <Tabs
          className="mt-4"
          items={[
            { key: "connections", label: zh.app.tabs.connections, children: <ConnectionsPage /> },
            { key: "workspace", label: zh.app.tabs.workspace, children: <WorkspacePage /> },
          ]}
        />
      </div>
    </div>
  );
}
