'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Popconfirm,
  message,
  Table,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { CampaignStorage, ChatbotStorage } from '@/lib/storage';
import type { Campaign, Chatbot } from '@/lib/types';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [filter, setFilter] = useState<'all' | Campaign['status']>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCampaigns(CampaignStorage.getAll() as Campaign[]);
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
  };

  const filteredCampaigns =
    filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const getChatbotNames = (chatbotIds: string[]) => {
    return chatbotIds
      .map((id) => chatbots.find((cb) => cb.id === id)?.name || 'Unknown')
      .join(', ');
  };

  const handleDeleteCampaign = (id: string) => {
    CampaignStorage.delete(id);
    message.success('Campaign deleted successfully!');
    loadData();
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
          <Text type='secondary' style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Chatbots',
      key: 'chatbots',
      render: (_: any, record: Campaign) => (
        <Text>{getChatbotNames(record.chatbotIds)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Campaign['status']) => {
        const colors: Record<Campaign['status'], string> = {
          draft: 'default',
          running: 'processing',
          paused: 'warning',
          completed: 'success',
          failed: 'error',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress || 0} size='small' style={{ width: 100 }} />
      ),
    },
    {
      title: 'Results',
      key: 'results',
      render: (_: any, record: Campaign) =>
        record.results ? (
          <Space size='small'>
            <Statistic
              title='Pass Rate'
              value={record.results.passRate}
              suffix='%'
              valueStyle={{ fontSize: 14 }}
            />
            <Statistic
              title='Quality'
              value={record.results.avgQualityScore}
              suffix='/ 5'
              valueStyle={{ fontSize: 14 }}
            />
          </Space>
        ) : (
          <Text type='secondary'>-</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space>
          <Link href={`/campaigns/${record.id}`}>
            <Button type='link' size='small' icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          {record.status === 'draft' && (
            <Button
              type='link'
              size='small'
              icon={<PlayCircleOutlined />}
              onClick={() =>
                message.info('Feature coming soon: Start campaign')
              }
            >
              Start
            </Button>
          )}
          <Popconfirm
            title='Delete campaign?'
            description='Are you sure you want to delete this campaign?'
            onConfirm={() => handleDeleteCampaign(record.id)}
            okText='Yes'
            cancelText='No'
          >
            <Button type='link' danger size='small' icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
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
            Evaluation Campaigns
          </Title>
          <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
            Manage and monitor your evaluation campaigns
          </Paragraph>
        </div>
        <Link href='/datasets/new'>
          <Button type='primary' icon={<PlusOutlined />} size='large'>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            All ({campaigns.length})
          </Button>
          <Button
            type={filter === 'running' ? 'primary' : 'default'}
            onClick={() => setFilter('running')}
          >
            Running ({campaigns.filter((c) => c.status === 'running').length})
          </Button>
          <Button
            type={filter === 'completed' ? 'primary' : 'default'}
            onClick={() => setFilter('completed')}
          >
            Completed (
            {campaigns.filter((c) => c.status === 'completed').length})
          </Button>
          <Button
            type={filter === 'draft' ? 'primary' : 'default'}
            onClick={() => setFilter('draft')}
          >
            Draft ({campaigns.filter((c) => c.status === 'draft').length})
          </Button>
        </Space>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCampaigns.map((c) => ({ ...c, key: c.id }))}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <Paragraph>No campaigns found</Paragraph>
                <Link href='/datasets/new'>
                  <Button type='primary'>Create Campaign</Button>
                </Link>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
