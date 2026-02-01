import { Tabs } from "antd";

import ConnectionsPage from "./pages/connections";
import WorkspacePage from "./pages/workspace";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">DB Query Tool MVP</h1>
        <Tabs
          className="mt-4"
          items={[
            { key: "connections", label: "Connections", children: <ConnectionsPage /> },
            { key: "workspace", label: "Workspace", children: <WorkspacePage /> },
          ]}
        />
      </div>
    </div>
  );
}
