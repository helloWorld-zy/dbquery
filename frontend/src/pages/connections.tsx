import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Form, Input, Modal, Select, Space, Table, Tag, message, Card, Typography } from "antd";
import { PlusOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import type { ConnectionResponse } from "../services/connections";
import {
  createConnection,
  deleteConnection,
  listConnections,
  testConnection,
  updateConnection,
} from "../services/connections";

const { Title, Text } = Typography;

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
      success: { text: "通过", color: "success", icon: <CheckCircleOutlined /> },
      failed: { text: "失败", color: "error", icon: <CloseCircleOutlined /> },
      unknown: { text: "未测试", color: "default", icon: <QuestionCircleOutlined /> },
    }),
    []
  );

  const columns = [
    { 
      title: "名称", 
      dataIndex: "name",
      render: (text: string) => <span className="font-medium text-slate-800">{text}</span>
    },
    {
      title: "数据库",
      dataIndex: "dbType",
      render: (value: string) => (
        <Tag color="blue" className="rounded-md mr-0">
          {value === "postgres" ? "PostgreSQL" : "MariaDB"}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "lastTestStatus",
      render: (value: ConnectionResponse["lastTestStatus"]) => {
        const meta = statusMeta[value] ?? statusMeta.unknown;
        return <Tag icon={meta.icon} color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "操作",
      render: (_: unknown, record: ConnectionResponse) => (
        <Space.Compact>
          <Button type="text" size="small" icon={<CheckCircleOutlined />} onClick={() => handleTest(record)} title="测试连接" />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} title="编辑" />
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} title="删除" />
        </Space.Compact>
      ),
    },
  ];

  return (
    <div className="py-2 animate-in fade-in duration-500">
      <header className="mb-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={2} className="!mb-1 !text-slate-800">连接管理</Title>
            <Text type="secondary" className="text-slate-500">
              配置数据库连接，支持 PostgreSQL 和 MariaDB。
            </Text>
          </div>
          <div className="hidden md:block">
            <Card size="small" className="!bg-blue-50 !border-blue-100 shadow-sm">
               <Space>
                 <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total</span>
                 <span className="text-xl font-bold text-blue-600 font-mono">{connections.length}</span>
               </Space>
            </Card>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">
        <div className="lg:sticky lg:top-24">
          <Card 
            title={<><PlusOutlined /> 新增连接</>} 
            className="shadow-sm border-slate-200"
            headStyle={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <Form form={form} layout="vertical" onFinish={handleCreate} requiredMark={false} className="pt-2">
              <Form.Item label="连接名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
                <Input placeholder="例如：生产库" prefix={<DatabaseOutlined className="text-slate-400" />} />
              </Form.Item>
              <Form.Item label="数据库类型" name="dbType" rules={[{ required: true, message: "请选择数据库" }]}>
                <Select options={dbOptions} placeholder="选择数据库类型" />
              </Form.Item>
              <Form.Item
                label="连接地址 (URL)"
                name="connectionUrl"
                tooltip="例如: postgresql://user:pass@host:5432/db"
                rules={[{ required: true, message: "请输入连接地址" }]}
              >
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="postgresql://..." className="font-mono text-xs" />
              </Form.Item>
              <Form.Item className="mb-0 mt-6">
                <Button type="primary" htmlType="submit" loading={loading} block size="large" icon={<PlusOutlined />}>
                  创建连接
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div className="min-w-0">
          <Card 
            title="连接列表" 
            className="shadow-sm border-slate-200"
            extra={<Button type="link" onClick={fetchConnections} size="small">刷新列表</Button>}
          >
            <Table 
              columns={columns} 
              dataSource={connections} 
              rowKey="id" 
              pagination={false}
              rowClassName="hover:bg-slate-50 transition-colors"
            />
          </Card>
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
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} className="pt-4">
          <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="数据库类型" name="dbType" rules={[{ required: true, message: "请选择数据库" }]}>
            <Select options={dbOptions} />
          </Form.Item>
          <Form.Item label="连接地址" name="connectionUrl" help="留空则保持不变">
            <Input.TextArea autoSize={{ minRows: 2 }} placeholder="连接地址..." className="font-mono text-xs" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
