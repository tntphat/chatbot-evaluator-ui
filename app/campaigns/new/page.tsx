'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  InputNumber,
  Select,
  Typography,
  Space,
  message,
  Radio,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CampaignStorage,
  ChatbotStorage,
  DatasetStorage,
  EvaluationStorage,
} from '@/lib/storage';
import type {
  Campaign,
  Chatbot,
  TestDataset,
  TestItem,
  EvaluationItem,
} from '@/lib/types';
import {
  DEFAULT_CRITERIA_THRESHOLDS,
  DEFAULT_OVERALL_THRESHOLD,
  type EvaluationCriteria,
} from '@/lib/mockLLMEvaluator';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type EvaluationMode = 'semantic' | 'criteria';

type CampaignFormValues = {
  name: string;
  description?: string;
  chatbotIds: string[];
  evaluationType: Array<'automated' | 'human'>;
  datasetId: string;
  metrics: string[];
  evaluationMode: EvaluationMode;
  metricThresholds?: Record<string, number>;
  overallThreshold?: number;
};

const DEFAULT_PRIORITY: TestItem['priority'] = 'medium';

const deriveUserMessage = (item: TestItem): string => {
  if (item.question) return item.question;
  const firstUserTurn = item.conversation?.find(
    (turn) => turn.speaker === 'user'
  );
  return firstUserTurn?.message || 'Manual review required';
};

const deriveExpectedAnswer = (item: TestItem): string => {
  if (item.expectedAnswer) return item.expectedAnswer;
  const firstBotTurn = item.conversation?.find(
    (turn) => turn.speaker === 'bot'
  );
  return firstBotTurn?.message || '';
};

const METRIC_OPTIONS = [
  {
    value: 'accuracy',
    label: 'Factuality (Accuracy)',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.accuracy,
  },
  {
    value: 'relevance',
    label: 'Task Fulfillment (Relevance)',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.relevance,
  },
  {
    value: 'coherence',
    label: 'Clarity & Coherence',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.coherence,
  },
  {
    value: 'completeness',
    label: 'Completeness',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.completeness,
  },
  {
    value: 'toxicity',
    label: 'Safety (Toxicity)',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.toxicity,
  },
  {
    value: 'hallucination',
    label: 'Hallucination Risk',
    defaultThreshold: DEFAULT_CRITERIA_THRESHOLDS.hallucination,
  },
] as const;

type MetricOptionValue = (typeof METRIC_OPTIONS)[number]['value'];

const BASE_CRITERIA_STATE: EvaluationCriteria = {
  checkAccuracy: true,
  accuracyThreshold: DEFAULT_CRITERIA_THRESHOLDS.accuracy,
  checkRelevance: true,
  relevanceThreshold: DEFAULT_CRITERIA_THRESHOLDS.relevance,
  checkCoherence: true,
  coherenceThreshold: DEFAULT_CRITERIA_THRESHOLDS.coherence,
  checkCompleteness: true,
  completenessThreshold: DEFAULT_CRITERIA_THRESHOLDS.completeness,
  checkToxicity: false,
  toxicityThreshold: DEFAULT_CRITERIA_THRESHOLDS.toxicity,
  checkHallucination: false,
  hallucinationThreshold: DEFAULT_CRITERIA_THRESHOLDS.hallucination,
  overallThreshold: DEFAULT_OVERALL_THRESHOLD,
};

const mergeWithBaseCriteria = (
  partial: Partial<EvaluationCriteria>
): EvaluationCriteria => ({
  ...BASE_CRITERIA_STATE,
  ...partial,
});

const CRITERIA_FLAG_KEYS: Array<keyof EvaluationCriteria> = [
  'checkAccuracy',
  'checkRelevance',
  'checkCoherence',
  'checkCompleteness',
  'checkToxicity',
  'checkHallucination',
];

const CRITERIA_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  value: EvaluationCriteria;
}> = [
  {
    id: 'balanced-quality',
    name: 'Balanced Quality',
    description: 'Accuracy, relevance, coherence, completeness (default set).',
    value: mergeWithBaseCriteria({}),
  },
  {
    id: 'factual-safety',
    name: 'Factual & Safety',
    description: 'Accuracy + hallucination & toxicity guardrails.',
    value: mergeWithBaseCriteria({
      checkRelevance: false,
      checkCoherence: false,
      checkCompleteness: true,
      checkToxicity: true,
      checkHallucination: true,
    }),
  },
  {
    id: 'instruction-compliance',
    name: 'Instruction Compliance',
    description:
      'Relevance, coherence, completeness – focus on following prompts.',
    value: mergeWithBaseCriteria({
      checkAccuracy: false,
      checkRelevance: true,
      checkCoherence: true,
      checkCompleteness: true,
      checkToxicity: false,
      checkHallucination: false,
    }),
  },
];

export default function CampaignCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [datasets, setDatasets] = useState<TestDataset[]>([]);
  const metricsWatchRaw = Form.useWatch('metrics', form);
  const metricThresholdsWatchRaw = Form.useWatch('metricThresholds', form);
  const overallThresholdWatch =
    Form.useWatch('overallThreshold', form) ?? DEFAULT_OVERALL_THRESHOLD;
  const evaluationModeWatch =
    Form.useWatch('evaluationMode', form) || 'semantic';

  const metricsWatch = useMemo(
    () => (metricsWatchRaw ?? []) as string[],
    [metricsWatchRaw]
  );
  const metricThresholdsWatch = useMemo(
    () => (metricThresholdsWatchRaw ?? {}) as Record<string, number>,
    [metricThresholdsWatchRaw]
  );

  useEffect(() => {
    startTransition(() => {
      setChatbots(ChatbotStorage.getAll() as Chatbot[]);
      setDatasets(DatasetStorage.getAll() as TestDataset[]);
    });
  }, []);

  useEffect(() => {
    const metricThresholds = (form.getFieldValue('metricThresholds') ||
      {}) as Record<string, number>;
    let changed = false;
    const next: Record<string, number> = { ...metricThresholds };

    (metricsWatch as string[]).forEach((metric) => {
      if (typeof next[metric] !== 'number') {
        const option = METRIC_OPTIONS.find((opt) => opt.value === metric);
        next[metric] = option?.defaultThreshold ?? DEFAULT_OVERALL_THRESHOLD;
        changed = true;
      }
    });

    Object.keys(next).forEach((metric) => {
      if (!metricsWatch.includes(metric)) {
        delete next[metric];
        changed = true;
      }
    });

    if (changed) {
      form.setFieldsValue({ metricThresholds: next });
    }
  }, [metricsWatch, form]);

  useEffect(() => {
    if (evaluationModeWatch === 'semantic') {
      const semanticMetrics: MetricOptionValue[] = ['accuracy'];
      form.setFieldsValue({
        metrics: semanticMetrics,
        metricThresholds: {
          accuracy: DEFAULT_CRITERIA_THRESHOLDS.accuracy,
        },
        overallThreshold: DEFAULT_OVERALL_THRESHOLD,
      });
    }
  }, [evaluationModeWatch, form]);

  const deriveCurrentCriteria = (): EvaluationCriteria => {
    const thresholds = metricThresholdsWatch as Record<string, number>;
    return mergeWithBaseCriteria({
      checkAccuracy: metricsWatch.includes('accuracy'),
      accuracyThreshold:
        thresholds.accuracy ?? DEFAULT_CRITERIA_THRESHOLDS.accuracy,
      checkRelevance: metricsWatch.includes('relevance'),
      relevanceThreshold:
        thresholds.relevance ?? DEFAULT_CRITERIA_THRESHOLDS.relevance,
      checkCoherence: metricsWatch.includes('coherence'),
      coherenceThreshold:
        thresholds.coherence ?? DEFAULT_CRITERIA_THRESHOLDS.coherence,
      checkCompleteness: metricsWatch.includes('completeness'),
      completenessThreshold:
        thresholds.completeness ?? DEFAULT_CRITERIA_THRESHOLDS.completeness,
      checkToxicity: metricsWatch.includes('toxicity'),
      toxicityThreshold:
        thresholds.toxicity ?? DEFAULT_CRITERIA_THRESHOLDS.toxicity,
      checkHallucination: metricsWatch.includes('hallucination'),
      hallucinationThreshold:
        thresholds.hallucination ?? DEFAULT_CRITERIA_THRESHOLDS.hallucination,
      overallThreshold: overallThresholdWatch,
    });
  };

  const handleTemplateApply = (template: EvaluationCriteria) => {
    const metrics: MetricOptionValue[] = [];
    if (template.checkAccuracy) metrics.push('accuracy');
    if (template.checkRelevance) metrics.push('relevance');
    if (template.checkCoherence) metrics.push('coherence');
    if (template.checkCompleteness) metrics.push('completeness');
    if (template.checkToxicity) metrics.push('toxicity');
    if (template.checkHallucination) metrics.push('hallucination');

    const metricThresholds = metrics.reduce<Record<string, number>>(
      (acc, metric) => {
        const key = `${metric}Threshold` as keyof EvaluationCriteria;
        const value = template[key];
        acc[metric] =
          typeof value === 'number'
            ? value
            : DEFAULT_CRITERIA_THRESHOLDS[metric];
        return acc;
      },
      {}
    );

    form.setFieldsValue({
      evaluationMode: 'criteria',
      metrics,
      metricThresholds,
      overallThreshold:
        typeof template.overallThreshold === 'number'
          ? template.overallThreshold
          : DEFAULT_OVERALL_THRESHOLD,
    });
  };

  const createManualReviewTasks = (
    campaign: Campaign,
    dataset: TestDataset,
    chatbotIds: string[]
  ) => {
    const primaryChatbotId = chatbotIds[0] ?? 'unknown_bot';

    const tasks: EvaluationItem[] = (dataset.items || []).map((item, index) => {
      const testItemId = item.id || `test_item_${Date.now()}_${index}`;
      return {
        id: `manual_${campaign.id}_${testItemId}_${index}`,
        campaignId: campaign.id,
        chatbotId: primaryChatbotId,
        testItemId,
        datasetId: dataset.id,
        userMessage: deriveUserMessage(item),
        botResponse: '',
        expectedAnswer: deriveExpectedAnswer(item),
        category: item.category,
        priority: item.priority || DEFAULT_PRIORITY,
        responseTime: 0,
        metrics: {
          accuracy: 0,
          hallucination: false,
        },
        issues: [],
        status: 'pending',
        passed: false,
        createdAt: new Date().toISOString(),
      };
    });

    tasks.forEach((task) => EvaluationStorage.add(task));
    return tasks.length;
  };

  const handleSubmit = (values: CampaignFormValues) => {
    const evaluationMode = values.evaluationMode || 'semantic';
    const selectedMetrics =
      values.metrics && values.metrics.length > 0
        ? (values.metrics as MetricOptionValue[])
        : (['accuracy'] as MetricOptionValue[]);

    const metricThresholds = selectedMetrics.reduce<Record<string, number>>(
      (acc, metric) => {
        const defaultThreshold =
          DEFAULT_CRITERIA_THRESHOLDS[metric] ?? DEFAULT_OVERALL_THRESHOLD;
        const provided = values.metricThresholds?.[metric];
        acc[metric] =
          typeof provided === 'number' ? provided : defaultThreshold;
        return acc;
      },
      {}
    );

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: values.name,
      description: values.description || '',
      chatbotIds: values.chatbotIds || [],
      evaluationType: values.evaluationType || ['automated'],
      datasetId: values.datasetId,
      status: 'draft' as const,
      metrics: selectedMetrics,
      evaluationMode,
      metricThresholds,
      overallThreshold:
        typeof values.overallThreshold === 'number'
          ? values.overallThreshold
          : DEFAULT_OVERALL_THRESHOLD,
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    CampaignStorage.add(newCampaign);
    message.success('Campaign created successfully!');

    if (values.evaluationType?.includes('human')) {
      const dataset = DatasetStorage.getById(
        values.datasetId
      ) as TestDataset | null;

      if (dataset && dataset.items && dataset.items.length > 0) {
        const taskCount = createManualReviewTasks(
          newCampaign,
          dataset,
          values.chatbotIds || []
        );
        if (taskCount > 0) {
          message.info(
            `${taskCount} manual review task(s) created for this campaign.`
          );
        }
      } else {
        message.warning(
          'Campaign created, but no manual review tasks were generated because the selected dataset has no items.'
        );
      }
    }

    router.push('/campaigns');
  };

  return (
    <div className='space-y-6'>
      <Space style={{ marginBottom: 16 }}>
        <Link href='/campaigns'>
          <Button icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
      </Space>

      <div>
        <Title level={2} style={{ margin: 0 }}>
          Create Evaluation Campaign
        </Title>
        <Paragraph style={{ marginTop: 8, color: '#666' }}>
          Define the chatbot, dataset, and evaluation criteria for this campaign
        </Paragraph>
      </div>

      <Card>
        <Form
          layout='vertical'
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            evaluationType: ['automated'],
            metrics: ['accuracy', 'relevance', 'coherence', 'completeness'],
            evaluationMode: 'semantic',
            metricThresholds: METRIC_OPTIONS.reduce(
              (acc, option) => ({
                ...acc,
                [option.value]: option.defaultThreshold,
              }),
              {}
            ),
            overallThreshold: DEFAULT_OVERALL_THRESHOLD,
          }}
        >
          <Form.Item
            label='Campaign Name'
            name='name'
            rules={[
              { required: true, message: 'Please enter a campaign name' },
            ]}
          >
            <Input
              placeholder='e.g. HR Bot Regression - April 2025'
              size='large'
            />
          </Form.Item>

          <Form.Item label='Description' name='description'>
            <TextArea
              rows={3}
              placeholder='Short description about this campaign'
            />
          </Form.Item>

          <Card
            type='inner'
            title='Select Chatbots'
            style={{ marginBottom: 16 }}
          >
            <Form.Item
              name='chatbotIds'
              rules={[
                { required: true, message: 'Select at least one chatbot' },
              ]}
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Space direction='vertical' style={{ width: '100%' }}>
                  {chatbots.length === 0 && (
                    <Paragraph type='secondary'>
                      No chatbots found. Seed data via storage utilities.
                    </Paragraph>
                  )}
                  {chatbots.map((chatbot) => (
                    <Card key={chatbot.id} size='small' hoverable>
                      <Checkbox value={chatbot.id} style={{ width: '100%' }}>
                        <strong>
                          {chatbot.name} ({chatbot.version})
                        </strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {chatbot.description}
                        </div>
                      </Checkbox>
                    </Card>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </Card>

          <Card
            type='inner'
            title='Evaluation Type'
            style={{ marginBottom: 16 }}
          >
            <Form.Item name='evaluationType'>
              <Checkbox.Group>
                <Space direction='vertical'>
                  <Checkbox value='automated'>
                    <strong>Automated</strong> – Auto evaluation with metrics
                  </Checkbox>
                  <Checkbox value='human'>
                    <strong>Human</strong> – Manual reviewer assignments
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </Card>

          <Card type='inner' title='Dataset & Metrics'>
            <Form.Item
              name='datasetId'
              label='Test Dataset'
              rules={[{ required: true, message: 'Please select a dataset' }]}
            >
              <Select
                placeholder='Select a dataset to use'
                size='large'
                allowClear
              >
                {datasets.map((dataset) => (
                  <Select.Option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.itemCount} items)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {evaluationModeWatch === 'criteria' ? (
              <>
                <div className='grid gap-3 sm:grid-cols-3'>
                  {CRITERIA_TEMPLATES.map((template) => {
                    const current = deriveCurrentCriteria();
                    const isActive = CRITERIA_FLAG_KEYS.every(
                      (flag) => current[flag] === template.value[flag]
                    );
                    return (
                      <button
                        key={template.id}
                        type='button'
                        onClick={() => handleTemplateApply(template.value)}
                        className={`text-left border rounded-lg p-3 transition ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className='font-semibold text-gray-900'>
                          {template.name}
                        </div>
                        <div className='text-xs text-gray-600 mt-1'>
                          {template.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Form.Item name='metrics' label='Metrics to Track'>
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Space direction='vertical' style={{ width: '100%' }}>
                      {METRIC_OPTIONS.map((option) => (
                        <Checkbox
                          value={option.value}
                          key={option.value}
                          style={{ width: '100%' }}
                        >
                          {option.label}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>

                {metricsWatch.length > 0 && (
                  <div className='mt-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded'>
                    <div className='text-sm font-semibold text-gray-800'>
                      Per-metric acceptable scores
                    </div>
                    <div className='space-y-2 mt-2'>
                      {metricsWatch.map((metric: string) => {
                        const option = METRIC_OPTIONS.find(
                          (opt) => opt.value === metric
                        );
                        if (!option) return null;
                        return (
                          <div
                            key={metric}
                            className='flex items-center justify-between gap-3'
                          >
                            <span className='text-sm text-gray-700'>
                              {option.label}
                            </span>
                            <Form.Item
                              name={['metricThresholds', metric]}
                              noStyle
                              rules={[
                                {
                                  type: 'number',
                                  min: 1,
                                  max: 5,
                                  message: 'Threshold must be between 1 and 5',
                                },
                              ]}
                            >
                              <InputNumber
                                min={1}
                                max={5}
                                step={0.1}
                                style={{ width: 80 }}
                              />
                            </Form.Item>
                          </div>
                        );
                      })}
                    </div>
                    <div className='text-xs text-gray-600 mt-2'>
                      Responses below these scores will be flagged during
                      automated evaluation.
                    </div>
                  </div>
                )}

                <Form.Item
                  name='overallThreshold'
                  label='Overall pass threshold'
                  rules={[
                    {
                      type: 'number',
                      min: 1,
                      max: 5,
                      message: 'Threshold must be between 1 and 5',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={5}
                    step={0.1}
                    style={{ width: 120 }}
                  />
                </Form.Item>
              </>
            ) : (
              <Alert
                type='info'
                showIcon
                message='Semantic compare uses quick embedding similarity. Detailed criteria and thresholds are disabled.'
              />
            )}
          </Card>

          <Card
            type='inner'
            title='Evaluation Mode'
            style={{ marginBottom: 16 }}
          >
            <Form.Item
              name='evaluationMode'
              rules={[{ required: true, message: 'Select evaluation mode' }]}
            >
              <Radio.Group>
                <Space direction='vertical'>
                  <Radio value='semantic'>
                    <strong>Quick Semantic Compare</strong> – Embedding
                    similarity only
                  </Radio>
                  <Radio value='criteria'>
                    <strong>LLM Criteria Compare</strong> – Use evaluator LLM to
                    score multiple criteria
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Card>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type='primary'
              htmlType='submit'
              icon={<SaveOutlined />}
              size='large'
            >
              Create Campaign
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
