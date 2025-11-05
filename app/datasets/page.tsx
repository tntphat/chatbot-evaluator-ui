'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Popconfirm,
  message,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { DatasetStorage } from '@/lib/storage';
import type { TestDataset } from '@/lib/types';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<TestDataset[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDatasets(DatasetStorage.getAll() as TestDataset[]);
  };

  const handleDelete = (id: string) => {
    DatasetStorage.delete(id);
    message.success('Dataset deleted successfully!');
    loadData();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Test Datasets
          </Title>
          <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
            Manage your evaluation test datasets
          </Paragraph>
        </div>
        <Link href='/datasets/new'>
          <Button type='primary' icon={<PlusOutlined />} size='large'>
            New Dataset
          </Button>
        </Link>
      </div>

      {datasets.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Paragraph style={{ fontSize: 16 }}>No datasets found</Paragraph>
            <Paragraph style={{ color: '#999' }}>
              Create your first test dataset
            </Paragraph>
            <Link href='/datasets/new'>
              <Button type='primary' size='large' style={{ marginTop: 16 }}>
                + Create Dataset
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {datasets.map((dataset) => (
            <Col key={dataset.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                title={
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {dataset.name}
                    </div>
                    <Tag color='blue'>{dataset.type.toUpperCase()}</Tag>
                  </div>
                }
                extra={<DatabaseOutlined style={{ fontSize: 24 }} />}
                actions={[
                  <Link key='view' href={`/datasets/${dataset.id}`}>
                    <Button type='link' icon={<EyeOutlined />}>
                      View
                    </Button>
                  </Link>,
                  <Popconfirm
                    key='delete'
                    title='Delete dataset?'
                    description='Are you sure?'
                    onConfirm={() => handleDelete(dataset.id)}
                    okText='Yes'
                    cancelText='No'
                  >
                    <Button type='link' danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: 48 }}>
                  {dataset.description}
                </Paragraph>

                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title='Items'
                      value={dataset.itemCount}
                      valueStyle={{ fontSize: 20, color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title='Version'
                      value={dataset.version}
                      valueStyle={{ fontSize: 20, color: '#722ed1' }}
                    />
                  </Col>
                </Row>

                <div style={{ marginTop: 12 }}>
                  <Space wrap>
                    {dataset.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </div>

                <Paragraph
                  type='secondary'
                  style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}
                >
                  📅 Updated: {new Date(dataset.updatedAt).toLocaleDateString()}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
