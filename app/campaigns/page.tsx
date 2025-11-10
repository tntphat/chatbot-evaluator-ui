'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
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
} from '@ant-design/icons';
import { CampaignStorage, ChatbotStorage } from '@/lib/storage';
import type { Campaign, Chatbot } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_CRITERIA_THRESHOLDS,
  DEFAULT_OVERALL_THRESHOLD,
  type EvaluationCriteria,
} from '@/lib/mockLLMEvaluator';

const { Title, Paragraph, Text } = Typography;

const SEMANTIC_ONLY_CRITERIA: EvaluationCriteria = {
  checkAccuracy: true,
  accuracyThreshold: DEFAULT_CRITERIA_THRESHOLDS.accuracy,
  checkRelevance: false,
  relevanceThreshold: DEFAULT_CRITERIA_THRESHOLDS.relevance,
  checkCoherence: false,
  coherenceThreshold: DEFAULT_CRITERIA_THRESHOLDS.coherence,
  checkCompleteness: false,
  completenessThreshold: DEFAULT_CRITERIA_THRESHOLDS.completeness,
  checkToxicity: false,
  toxicityThreshold: DEFAULT_CRITERIA_THRESHOLDS.toxicity,
  checkHallucination: false,
  hallucinationThreshold: DEFAULT_CRITERIA_THRESHOLDS.hallucination,
  overallThreshold: DEFAULT_OVERALL_THRESHOLD,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    () => CampaignStorage.getAll() as Campaign[]
  );
  const [chatbots, setChatbots] = useState<Chatbot[]>(
    () => ChatbotStorage.getAll() as Chatbot[]
  );
  const [filter, setFilter] = useState<'all' | Campaign['status']>('all');
  const router = useRouter();

  const loadData = () => {
    setCampaigns(CampaignStorage.getAll() as Campaign[]);
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
  };

  const filteredCampaigns =
    filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const buildCriteriaFromCampaign = (
    campaign: Campaign
  ): EvaluationCriteria => {
    const metrics = campaign.metrics || [];
    const thresholds = campaign.metricThresholds || {};
    const getThreshold = (metric: keyof typeof DEFAULT_CRITERIA_THRESHOLDS) =>
      (thresholds as Record<string, number | undefined>)[metric] ??
      DEFAULT_CRITERIA_THRESHOLDS[metric];

    return {
      checkAccuracy: metrics.includes('accuracy') || metrics.length === 0,
      accuracyThreshold: getThreshold('accuracy'),
      checkRelevance: metrics.includes('relevance'),
      relevanceThreshold: getThreshold('relevance'),
      checkCoherence: metrics.includes('coherence'),
      coherenceThreshold: getThreshold('coherence'),
      checkCompleteness: metrics.includes('completeness'),
      completenessThreshold: getThreshold('completeness'),
      checkToxicity: metrics.includes('toxicity'),
      toxicityThreshold: getThreshold('toxicity'),
      checkHallucination: metrics.includes('hallucination'),
      hallucinationThreshold: getThreshold('hallucination'),
      overallThreshold:
        typeof campaign.overallThreshold === 'number'
          ? campaign.overallThreshold
          : DEFAULT_OVERALL_THRESHOLD,
    };
  };

  const handleStartCampaign = (campaign: Campaign) => {
    if (!campaign.datasetId) {
      message.error('Campaign does not have an associated dataset.');
      return;
    }

    const chatbotId = campaign.chatbotIds?.[0];
    if (!chatbotId) {
      message.error('Campaign does not have any chatbot selected.');
      return;
    }

    const mode: 'semantic' | 'criteria' = campaign.evaluationMode ?? 'criteria';

    CampaignStorage.update(campaign.id, {
      status: 'running',
      startedAt: new Date().toISOString(),
      progress: 0,
    });
    loadData();

    if (typeof window !== 'undefined') {
      const rerunConfig = {
        datasetId: campaign.datasetId,
        chatbotId,
        evaluator: mode === 'semantic' ? 'embedding' : 'gpt-4',
        mode,
        criteria:
          mode === 'semantic'
            ? { ...SEMANTIC_ONLY_CRITERIA }
            : buildCriteriaFromCampaign(campaign),
        campaignId: campaign.id,
      };
      window.localStorage.setItem(
        'auto_eval_rerun_config',
        JSON.stringify(rerunConfig)
      );
    }
    router.push('/auto-evaluate');
  };

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
      render: (_: unknown, record: Campaign) => (
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
      title: 'Mode',
      dataIndex: 'evaluationMode',
      key: 'evaluationMode',
      render: (mode: Campaign['evaluationMode']) =>
        mode === 'semantic' ? 'Semantic' : 'Criteria',
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
      render: (_: unknown, record: Campaign) =>
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
      render: (_: unknown, record: Campaign) => (
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
              onClick={() => handleStartCampaign(record)}
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
        <Link href='/campaigns/new'>
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
