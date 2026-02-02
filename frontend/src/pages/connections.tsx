import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";

import type { ConnectionResponse } from "../services/connections";
import {
  createConnection,
  deleteConnection,
  listConnections,
  testConnection,
  updateConnection,
} from "../services/connections";

const dbOptions = [
  { label: "PostgreSQL", value: "postgres" },
  { label: "MariaDB", value: "mariadb" },
];

export default function ConnectionsPage() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [connections, setConnections] = useState<ConnectionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ConnectionResponse | null>(null);

  const fetchConnections = async () => {
    const response = await listConnections();
    setConnections(response.items);
  };

  useEffect(() => {
    void fetchConnections();
  }, []);

  const handleCreate = async (values: { name: string; dbType: "postgres" | "mariadb"; connectionUrl: string }) => {
    setLoading(true);
    try {
      await createConnection(values);
      message.success("连接创建成功");
      form.resetFields();
      await fetchConnections();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (record: ConnectionResponse) => {
    try {
      const response = await testConnection(record.id);
      const nextStatus = response.status === "success" ? "success" : "failed";
      setConnections((prev) =>
        prev.map((item) => (item.id === record.id ? { ...item, lastTestStatus: nextStatus } : item))
      );
      message.success(response.status === "success" ? "连接测试通过" : "连接测试失败");
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (record: ConnectionResponse) => {
    try {
      await deleteConnection(record.id);
      message.success("连接已删除");
      await fetchConnections();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openEdit = (record: ConnectionResponse) => {
    setEditing(record);
    editForm.setFieldsValue({
      name: record.name,
      dbType: record.dbType,
      connectionUrl: "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (values: {
    name: string;
    dbType: "postgres" | "mariadb";
    connectionUrl?: string;
  }) => {
    if (!editing) {
      return;
    }
    try {
      const payload = {
        name: values.name,
        dbType: values.dbType,
        ...(values.connectionUrl?.trim() ? { connectionUrl: values.connectionUrl.trim() } : {}),
      };
      await updateConnection(editing.id, payload);
      message.success("连接已更新");
      setEditOpen(false);
      setEditing(null);
      await fetchConnections();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const statusMeta = useMemo(
    () => ({
      success: { text: "通过", color: "green" },
      failed: { text: "失败", color: "red" },
      unknown: { text: "未测试", color: "default" },
    }),
    []
  );

  const columns = [
    { title: "名称", dataIndex: "name" },
    {
      title: "数据库",
      dataIndex: "dbType",
      render: (value: string) => (value === "postgres" ? "PostgreSQL" : "MariaDB"),
    },
    {
      title: "状态",
      dataIndex: "lastTestStatus",
      render: (value: ConnectionResponse["lastTestStatus"]) => {
        const meta = statusMeta[value] ?? statusMeta.unknown;
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "操作",
      render: (_: unknown, record: ConnectionResponse) => (
        <Space>
          <Button size="small" onClick={() => handleTest(record)}>
            测试
          </Button>
          <Button size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-cyan-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-3" color="#0ea5e9" text="数据库连接" />
            <h2 className="text-3xl font-semibold text-slate-900 font-['Newsreader']">
              连接管理
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              统一管理数据库连接，支持测试、编辑与删除操作。连接测试结果会实时刷新。
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">当前</div>
            <div className="text-2xl font-semibold text-slate-900">
              {connections.length}
              <span className="ml-2 text-sm font-normal text-slate-500">连接</span>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <h3 className="text-lg font-semibold text-slate-900 font-['Newsreader']">新增连接</h3>
            <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-5 space-y-4">
              <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
                <Input placeholder="例如：生产库" />
              </Form.Item>
              <Form.Item label="数据库类型" name="dbType" rules={[{ required: true, message: "请选择数据库" }]}>
                <Select options={dbOptions} placeholder="选择数据库类型" />
              </Form.Item>
              <Form.Item
                label="连接地址"
                name="connectionUrl"
                rules={[{ required: true, message: "请输入连接地址" }]}
              >
                <Input placeholder="postgresql://user:pass@host:5432/db" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                  创建连接
                </Button>
              </Form.Item>
            </Form>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 font-['Newsreader']">连接列表</h3>
              <span className="text-xs text-slate-400">最近状态</span>
            </div>
            <Table className="mt-4" columns={columns} dataSource={connections} rowKey="id" />
          </section>
        </div>
      </div>

      <Modal
        open={editOpen}
        title="编辑连接"
        okText="保存"
        cancelText="取消"
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onOk={() => editForm.submit()}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="数据库类型" name="dbType" rules={[{ required: true, message: "请选择数据库" }]}>
            <Select options={dbOptions} />
          </Form.Item>
          <Form.Item label="连接地址" name="connectionUrl">
            <Input placeholder="留空则保持不变" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
