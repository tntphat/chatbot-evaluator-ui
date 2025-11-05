'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Typography,
  Space,
} from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  StarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  CampaignStorage,
  ChatbotStorage,
  DatasetStorage,
  initializeMockData,
} from '@/lib/storage';
import type { Campaign } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function Dashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalChatbots: 0,
    totalDatasets: 0,
    avgQuality: 0,
    avgPassRate: 0,
  });

  useEffect(() => {
    initializeMockData();

    const campaignsData = CampaignStorage.getAll() as Campaign[];
    const chatbotsData = ChatbotStorage.getAll();
    const datasetsData = DatasetStorage.getAll();

    setCampaigns(campaignsData);

    const activeCampaigns = campaignsData.filter(
      (c) => c.status === 'running'
    ).length;
    const completedCampaigns = campaignsData.filter(
      (c) => c.status === 'completed'
    );

    const avgQuality =
      completedCampaigns.length > 0
        ? completedCampaigns.reduce(
            (sum, c) => sum + (c.results?.avgQualityScore || 0),
            0
          ) / completedCampaigns.length
        : 0;

    const avgPassRate =
      completedCampaigns.length > 0
        ? completedCampaigns.reduce(
            (sum, c) => sum + (c.results?.passRate || 0),
            0
          ) / completedCampaigns.length
        : 0;

    setStats({
      totalCampaigns: campaignsData.length,
      activeCampaigns,
      totalChatbots: chatbotsData.length,
      totalDatasets: datasetsData.length,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgPassRate: Math.round(avgPassRate),
    });
  }, []);

  const getStatusTag = (status: Campaign['status']) => {
    const colors: Record<Campaign['status'], string> = {
      draft: 'default',
      running: 'processing',
      paused: 'warning',
      completed: 'success',
      failed: 'error',
    };
    return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <Link href={`/campaigns/${record.id}`} style={{ fontWeight: 600 }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Campaign['status']) => getStatusTag(status),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress || 0}%`,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Campaign) => (
        <Button type='link' size='small' href={`/campaigns/${record.id}`}>
          View Details →
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
          Overview of your chatbot evaluation metrics
        </Paragraph>
      </div>

      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Total Campaigns'
              value={stats.totalCampaigns}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Active Campaigns'
              value={stats.activeCampaigns}
              prefix={<PlayCircleOutlined />}
              valueStyle={{
                color: stats.activeCampaigns > 0 ? '#3f8600' : '#666',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Average Quality'
              value={stats.avgQuality}
              suffix='/ 5'
              prefix={<StarOutlined />}
              valueStyle={{
                color:
                  stats.avgQuality >= 4
                    ? '#3f8600'
                    : stats.avgQuality >= 3
                    ? '#fa8c16'
                    : '#cf1322',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Pass Rate'
              value={stats.avgPassRate}
              suffix='%'
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: stats.avgPassRate >= 85 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title='Total Chatbots'
              value={stats.totalChatbots}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title='Test Datasets'
              value={stats.totalDatasets}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Campaigns */}
      <Card
        title='Recent Campaigns'
        extra={
          <Button type='primary' href='/campaigns/new'>
            + New Campaign
          </Button>
        }
      >
        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Paragraph style={{ fontSize: 16, color: '#666' }}>
              No campaigns yet
            </Paragraph>
            <Paragraph style={{ color: '#999' }}>
              Create your first evaluation campaign to get started
            </Paragraph>
            <Button
              type='primary'
              size='large'
              style={{ marginTop: 16 }}
              href='/campaigns/new'
            >
              Create Campaign
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={campaigns.map((c) => ({ ...c, key: c.id }))}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      {/* Quick Actions */}
      <Card title='Quick Actions' style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderStyle: 'dashed',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/campaigns/new')}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <Title level={4} style={{ marginBottom: 8 }}>
                New Campaign
              </Title>
              <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                Start evaluation
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderStyle: 'dashed',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/datasets')}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <Title level={4} style={{ marginBottom: 8 }}>
                Manage Datasets
              </Title>
              <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                Create test data
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderStyle: 'dashed',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/comparison')}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
              <Title level={4} style={{ marginBottom: 8 }}>
                Compare Chatbots
              </Title>
              <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                A/B testing
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
