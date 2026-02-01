import { useEffect, useState } from "react";
import { Button, Form, Input, Select, Space, Table, message } from "antd";

import type { ConnectionResponse } from "../services/connections";
import { createConnection, deleteConnection, listConnections, testConnection } from "../services/connections";

const dbOptions = [
  { label: "PostgreSQL", value: "postgres" },
  { label: "MariaDB", value: "mariadb" },
];

export default function ConnectionsPage() {
  const [form] = Form.useForm();
  const [connections, setConnections] = useState<ConnectionResponse[]>([]);
  const [loading, setLoading] = useState(false);

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
      message.success("Connection created");
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
      message.success(response.status === "success" ? "Connection ok" : "Connection failed");
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (record: ConnectionResponse) => {
    try {
      await deleteConnection(record.id);
      message.success("Connection deleted");
      await fetchConnections();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "DB", dataIndex: "dbType" },
    { title: "Status", dataIndex: "lastTestStatus" },
    {
      title: "Actions",
      render: (_: unknown, record: ConnectionResponse) => (
        <Space>
          <Button size="small" onClick={() => handleTest(record)}>
            Test
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold">Connections</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Connection name" />
        </Form.Item>
        <Form.Item label="Database" name="dbType" rules={[{ required: true }]}>
          <Select options={dbOptions} placeholder="Select database" />
        </Form.Item>
        <Form.Item label="Connection URL" name="connectionUrl" rules={[{ required: true }]}>
          <Input placeholder="postgresql://user:pass@host:5432/db" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </Form.Item>
      </Form>

      <Table className="mt-6" columns={columns} dataSource={connections} rowKey="id" />
    </div>
  );
}
