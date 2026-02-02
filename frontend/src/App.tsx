import { Tabs } from "antd";
import { DatabaseOutlined, ConsoleSqlOutlined } from "@ant-design/icons";

import ConnectionsPage from "./pages/connections";
import WorkspacePage from "./pages/workspace";
import zh from "./locales/zh";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-10">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                <ConsoleSqlOutlined className="text-lg" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">{zh.app.title}</h1>
            </div>
            <div className="text-sm text-slate-500 hidden sm:block">v1.2.0</div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Tabs
          defaultActiveKey="connections"
          type="card"
          className="custom-tabs"
          items={[
            { 
              key: "connections", 
              label: (
                <span className="flex items-center gap-2">
                  <DatabaseOutlined /> {zh.app.tabs.connections}
                </span>
              ), 
              children: <ConnectionsPage /> 
            },
            { 
              key: "workspace", 
              label: (
                <span className="flex items-center gap-2">
                  <ConsoleSqlOutlined /> {zh.app.tabs.workspace}
                </span>
              ), 
              children: <WorkspacePage /> 
            },
          ]}
        />
      </div>
    </div>
  );
}
