'use client';

import { useEffect, useState, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Alert,
  Descriptions,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FileTextOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { CampaignStorage, ChatbotStorage } from '@/lib/storage';
import type { Campaign, Chatbot } from '@/lib/types';
import Link from 'next/link';
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

type MetricKey =
  | 'accuracy'
  | 'relevance'
  | 'coherence'
  | 'completeness'
  | 'toxicity'
  | 'hallucination';

const METRIC_LABELS: Record<MetricKey, string> = {
  accuracy: 'Factuality (Accuracy)',
  relevance: 'Task Fulfillment (Relevance)',
  coherence: 'Clarity & Coherence',
  completeness: 'Completeness',
  toxicity: 'Safety (Toxicity)',
  hallucination: 'Hallucination Risk',
};

const CRITERIA_DISPLAY_CONFIG: Array<{
  key: MetricKey;
  flag: keyof EvaluationCriteria;
  thresholdKey: keyof EvaluationCriteria;
}> = [
  { key: 'accuracy', flag: 'checkAccuracy', thresholdKey: 'accuracyThreshold' },
  {
    key: 'relevance',
    flag: 'checkRelevance',
    thresholdKey: 'relevanceThreshold',
  },
  {
    key: 'coherence',
    flag: 'checkCoherence',
    thresholdKey: 'coherenceThreshold',
  },
  {
    key: 'completeness',
    flag: 'checkCompleteness',
    thresholdKey: 'completenessThreshold',
  },
  {
    key: 'toxicity',
    flag: 'checkToxicity',
    thresholdKey: 'toxicityThreshold',
  },
  {
    key: 'hallucination',
    flag: 'checkHallucination',
    thresholdKey: 'hallucinationThreshold',
  },
];

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  useEffect(() => {
    const id = params.id as string;
    const campaignData = CampaignStorage.getById(id) as Campaign | null;

    if (!campaignData) {
      message.error('Campaign not found!');
      router.push('/campaigns');
      return;
    }

    startTransition(() => {
      setCampaign(campaignData);
      setChatbots(ChatbotStorage.getAll() as Chatbot[]);
    });
  }, [params.id, router]);

  if (!campaign) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading...</div>
    );
  }

  const appliedCriteria = buildCriteriaFromCampaign(campaign);
  const enabledCriteria = CRITERIA_DISPLAY_CONFIG.filter(({ flag }) =>
    Boolean(appliedCriteria[flag])
  );

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

  const getChatbotNames = () => {
    return campaign.chatbotIds
      .map((id) => chatbots.find((cb) => cb.id === id)?.name || 'Unknown')
      .join(', ');
  };

  function buildCriteriaFromCampaign(camp: Campaign): EvaluationCriteria {
    const metrics = camp.metrics || [];
    const thresholds = camp.metricThresholds || {};
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
        typeof camp.overallThreshold === 'number'
          ? camp.overallThreshold
          : DEFAULT_OVERALL_THRESHOLD,
    };
  }

  const handleStartCampaign = () => {
    if (!campaign) return;
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
    const updated = CampaignStorage.getById(campaign.id) as Campaign;
    setCampaign(updated);

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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Link href='/campaigns'>
            <Button icon={<ArrowLeftOutlined />}>Back</Button>
          </Link>
        </Space>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <Space align='center'>
              <Title level={2} style={{ margin: 0 }}>
                {campaign.name}
              </Title>
              {getStatusTag(campaign.status)}
            </Space>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              {campaign.description}
            </Paragraph>
          </div>
          <Space>
            {campaign.status === 'draft' && (
              <Button
                type='primary'
                icon={<PlayCircleOutlined />}
                onClick={handleStartCampaign}
              >
                Start Campaign
              </Button>
            )}
            {campaign.status === 'running' && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={() =>
                  message.info('Feature coming soon: Pause campaign')
                }
              >
                Pause
              </Button>
            )}
            {campaign.status === 'completed' && (
              <Button
                type='primary'
                icon={<DownloadOutlined />}
                onClick={() =>
                  message.info('Feature coming soon: Download report')
                }
              >
                Download Report
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Campaign Info */}
      <Card title='Campaign Information' style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label='Chatbot(s)'>
            {getChatbotNames()}
          </Descriptions.Item>
          <Descriptions.Item label='Evaluation Type'>
            {campaign.evaluationType.join(' + ')}
          </Descriptions.Item>
          <Descriptions.Item label='Evaluation Mode'>
            {campaign.evaluationMode === 'criteria'
              ? 'LLM Criteria Compare'
              : 'Quick Semantic Compare'}
          </Descriptions.Item>
          <Descriptions.Item label='Overall Threshold'>
            {(
              appliedCriteria.overallThreshold ?? DEFAULT_OVERALL_THRESHOLD
            ).toFixed(1)}
            /5.0
          </Descriptions.Item>
          <Descriptions.Item label='Created'>
            {new Date(campaign.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label='Status'>
            {getStatusTag(campaign.status)}
          </Descriptions.Item>
          <Descriptions.Item label='Metric Thresholds' span={2}>
            {enabledCriteria.length === 0 ? (
              <Text type='secondary'>No metrics configured.</Text>
            ) : (
              <div style={{ display: 'grid', rowGap: 4 }}>
                {enabledCriteria.map(({ key, thresholdKey }) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span>{METRIC_LABELS[key]}</span>
                    <span style={{ fontWeight: 600 }}>
                      {(() => {
                        const rawThreshold = appliedCriteria[thresholdKey] as
                          | number
                          | undefined
                          | boolean;
                        const value =
                          typeof rawThreshold === 'number'
                            ? rawThreshold
                            : DEFAULT_CRITERIA_THRESHOLDS[key];
                        return `≥ ${value.toFixed(1)}`;
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Progress */}
      {(campaign.status === 'running' || campaign.status === 'completed') && (
        <Card title='Progress' style={{ marginBottom: 16 }}>
          <Progress percent={campaign.progress || 0} status='active' />
        </Card>
      )}

      {/* Results */}
      {campaign.results && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title='Pass Rate'
                  value={campaign.results.passRate}
                  suffix='%'
                  valueStyle={{
                    color:
                      campaign.results.passRate >= 85 ? '#3f8600' : '#cf1322',
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title='Quality Score'
                  value={campaign.results.avgQualityScore}
                  suffix='/ 5'
                  valueStyle={{
                    color:
                      campaign.results.avgQualityScore >= 4
                        ? '#3f8600'
                        : '#fa8c16',
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title='Task Completion'
                  value={campaign.results.taskCompletionRate}
                  suffix='%'
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title='Avg Response Time'
                  value={campaign.results.avgResponseTime}
                  suffix='ms'
                  valueStyle={{
                    color:
                      campaign.results.avgResponseTime < 500
                        ? '#3f8600'
                        : '#cf1322',
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title='Test Summary'>
                <Descriptions column={1}>
                  <Descriptions.Item label='Total Tests'>
                    {campaign.results.totalTests}
                  </Descriptions.Item>
                  <Descriptions.Item label='Passed'>
                    <Text type='success'>{campaign.results.passedTests}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Failed'>
                    <Text type='danger'>{campaign.results.failedTests}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Error Rate'>
                    {campaign.results.errorRate}%
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title='Quality Metrics'>
                <Descriptions column={1}>
                  <Descriptions.Item label='Accuracy'>
                    {campaign.results.avgAccuracy}%
                  </Descriptions.Item>
                  <Descriptions.Item label='Quality Score'>
                    {campaign.results.avgQualityScore} / 5
                  </Descriptions.Item>
                  <Descriptions.Item label='Task Completion'>
                    {campaign.results.taskCompletionRate}%
                  </Descriptions.Item>
                  <Descriptions.Item label='Response Time'>
                    {campaign.results.avgResponseTime}ms
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Recommendations */}
          <Card title='Recommendations' style={{ marginBottom: 16 }}>
            <Space direction='vertical' style={{ width: '100%' }}>
              {campaign.results.passRate < 85 && (
                <Alert
                  message='Pass rate below target'
                  description='Consider reviewing failed test cases and improving chatbot responses'
                  type='warning'
                  showIcon
                />
              )}
              {campaign.results.avgQualityScore >= 4 && (
                <Alert
                  message='High quality score'
                  description='Chatbot performance meets quality standards'
                  type='success'
                  showIcon
                />
              )}
              {campaign.results.avgResponseTime > 500 && (
                <Alert
                  message='Optimize response time'
                  description='Consider caching or model optimization to improve speed'
                  type='info'
                  showIcon
                />
              )}
            </Space>
          </Card>
        </>
      )}

      {/* Actions */}
      <Card title='Actions'>
        <Space>
          <Button
            type='primary'
            icon={<FileTextOutlined />}
            onClick={() =>
              message.info('Feature coming in Phase 2: Export PDF report')
            }
          >
            Export Report (PDF)
          </Button>
          <Button
            icon={<TableOutlined />}
            onClick={() =>
              message.info('Feature coming in Phase 2: Export CSV data')
            }
          >
            Export Data (CSV)
          </Button>
        </Space>
      </Card>
    </div>
  );
}
