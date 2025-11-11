'use client';

import { useEffect, useMemo, useRef, useState, startTransition } from 'react';
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
  chatbotId?: string;
  evaluationType: Array<'automated' | 'human'>;
  datasetId: string;
  datasetSource?: 'existing' | 'manual' | 'import-json';
  metrics: string[];
  evaluationMode: EvaluationMode;
  metricThresholds?: Record<string, number>;
  overallThreshold?: number;
};

const DEFAULT_PRIORITY: TestItem['priority'] = 'medium';

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

const buildCriteriaFromCampaign = (campaign: Campaign): EvaluationCriteria => {
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

type InlineDatasetItem = {
  id: string;
  question: string;
  expectedAnswer: string;
  category?: string;
};

export default function CampaignCreatePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [datasets, setDatasets] = useState<TestDataset[]>([]);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const metricsWatchRaw = Form.useWatch('metrics', form);
  const metricThresholdsWatchRaw = Form.useWatch('metricThresholds', form);
  const overallThresholdWatch =
    Form.useWatch('overallThreshold', form) ?? DEFAULT_OVERALL_THRESHOLD;
  const evaluationModeWatch =
    Form.useWatch('evaluationMode', form) || 'semantic';
  const datasetSourceWatch = Form.useWatch('datasetSource', form) || 'existing';

  const metricsWatch = useMemo(
    () => (metricsWatchRaw ?? []) as string[],
    [metricsWatchRaw]
  );
  const metricThresholdsWatch = useMemo(
    () => (metricThresholdsWatchRaw ?? {}) as Record<string, number>,
    [metricThresholdsWatchRaw]
  );
  const [inlineItems, setInlineItems] = useState<InlineDatasetItem[]>([]);
  const [inlineDraft, setInlineDraft] = useState({
    question: '',
    expectedAnswer: '',
    category: '',
  });
  const [importedItems, setImportedItems] = useState<InlineDatasetItem[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedFileName, setImportedFileName] = useState('');

  const resetInlineDraft = () => {
    setInlineDraft({
      question: '',
      expectedAnswer: '',
      category: '',
    });
  };

  const handleAddInlineItem = () => {
    if (!inlineDraft.question.trim() || !inlineDraft.expectedAnswer.trim()) {
      message.warning('Please fill in both question and expected answer.');
      return;
    }

    setInlineItems((prev) => [
      ...prev,
      {
        id: `inline_${Date.now()}_${prev.length}`,
        question: inlineDraft.question.trim(),
        expectedAnswer: inlineDraft.expectedAnswer.trim(),
        category: inlineDraft.category.trim() || undefined,
      },
    ]);
    resetInlineDraft();
  };

  const handleRemoveInlineItem = (id: string) => {
    setInlineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearInlineItems = () => {
    setInlineItems([]);
  };

  const handleImportJson = (file: File | null | undefined) => {
    if (!file) {
      setImportedFileName('');
      return;
    }
    setImportedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) {
          throw new Error('JSON must be an array of items');
        }
        const normalized: InlineDatasetItem[] = (parsed as unknown[]).map(
          (entry, index) => {
            if (typeof entry !== 'object' || entry === null) {
              throw new Error(
                `Item at index ${index} is not a valid object with data`
              );
            }
            const record = entry as {
              question?: unknown;
              expectedAnswer?: unknown;
              category?: unknown;
            };
            if (
              typeof record.question !== 'string' ||
              typeof record.expectedAnswer !== 'string'
            ) {
              throw new Error(
                `Item at index ${index} is missing question or expectedAnswer`
              );
            }
            return {
              id: `import_${Date.now()}_${index}`,
              question: record.question,
              expectedAnswer: record.expectedAnswer,
              category:
                typeof record.category === 'string'
                  ? record.category
                  : undefined,
            };
          }
        );

        if (normalized.length === 0) {
          throw new Error('No valid question-answer pairs found in file');
        }

        setImportedItems(normalized);
        setImportError(null);
        message.success(`Imported ${normalized.length} items successfully.`);
      } catch (error) {
        console.error('Failed to parse dataset JSON', error);
        const fallbackMessage =
          error instanceof Error
            ? error.message
            : 'Failed to parse JSON. Please check file format.';
        setImportError(fallbackMessage);
        setImportedItems([]);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file.');
      setImportedItems([]);
    };
    reader.readAsText(file);
  };

  const handleClearImportedItems = () => {
    setImportedItems([]);
    setImportError(null);
    setImportedFileName('');
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    startTransition(() => {
      setChatbots(ChatbotStorage.getAll() as Chatbot[]);
      setDatasets(DatasetStorage.getAll() as TestDataset[]);
    });
  }, []);

  useEffect(() => {
    if (datasetSourceWatch !== 'existing') {
      form.setFieldsValue({ datasetId: undefined });
    }
    if (datasetSourceWatch !== 'import-json') {
      setImportError(null);
      setImportedItems([]);
      setImportedFileName('');
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    }
  }, [datasetSourceWatch, form]);

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

  const finalizeCampaignCreation = (
    createdCampaign: Campaign,
    datasetForCampaign: TestDataset,
    startImmediately: boolean
  ) => {
    CampaignStorage.add(createdCampaign);
    message.success('Campaign created successfully!');

    if (startImmediately) {
      const chatbotId = createdCampaign.chatbotIds?.[0];
      if (!chatbotId) {
        message.error('Campaign created but no chatbot selected to start.');
        router.push('/campaigns');
        return;
      }

      CampaignStorage.update(createdCampaign.id, {
        status: 'running',
        startedAt: new Date().toISOString(),
        progress: 0,
      });
      message.success('Campaign started!');

      if (typeof window !== 'undefined') {
        const mode: 'semantic' | 'criteria' =
          createdCampaign.evaluationMode ?? 'criteria';
        const rerunConfig = {
          datasetId: datasetForCampaign.id,
          chatbotId,
          evaluator: mode === 'semantic' ? 'embedding' : 'gpt-4',
          mode,
          criteria:
            mode === 'semantic'
              ? { ...SEMANTIC_ONLY_CRITERIA }
              : buildCriteriaFromCampaign(createdCampaign),
          campaignId: createdCampaign.id,
        };
        window.localStorage.setItem(
          'auto_eval_rerun_config',
          JSON.stringify(rerunConfig)
        );
      }
    }

    if (createdCampaign.evaluationType?.includes('human')) {
      if (datasetForCampaign.items && datasetForCampaign.items.length > 0) {
        const taskCount = createManualReviewTasks(
          createdCampaign,
          datasetForCampaign,
          createdCampaign.chatbotIds || []
        );
        if (taskCount > 0) {
          message.info(
            `${taskCount} manual review task(s) created for this campaign.`
          );
        }
      } else {
        message.warning(
          'Campaign created, but no manual review tasks were generated because the dataset has no items.'
        );
      }
    }

    router.push(startImmediately ? '/auto-evaluate' : '/campaigns');
  };

  const handleCreateCampaign = (
    values: CampaignFormValues,
    startImmediately: boolean
  ) => {
    const datasetSource = values.datasetSource || 'existing';
    let datasetId: string | undefined = values.datasetId;
    let datasetForCampaign: TestDataset | null = null;

    if (datasetSource === 'existing') {
      if (!datasetId) {
        message.error('Please select a dataset for this campaign.');
        return;
      }
      datasetForCampaign = DatasetStorage.getById(
        datasetId
      ) as TestDataset | null;
      if (!datasetForCampaign) {
        message.error('Selected dataset could not be found. Please try again.');
        return;
      }
    } else if (datasetSource === 'manual') {
      if (inlineItems.length === 0) {
        message.error(
          'Please add at least one question-answer pair for the new dataset.'
        );
        return;
      }
      const createdAt = new Date().toISOString();
      const inlineDatasetItems: TestItem[] = inlineItems.map((item, index) => ({
        id: item.id || `inline_item_${Date.now()}_${index}`,
        type: 'qa',
        question: item.question,
        expectedAnswer: item.expectedAnswer,
        category: item.category,
        priority: DEFAULT_PRIORITY,
        difficulty: 'medium',
      }));

      const createdDataset: TestDataset = {
        id: `ds_inline_${Date.now()}`,
        name: `${values.name || 'Campaign'} Inline Dataset`,
        description: 'Dataset created during campaign setup (manual entry).',
        type: 'qa',
        tags: [],
        itemCount: inlineDatasetItems.length,
        version: '1.0',
        createdAt,
        updatedAt: createdAt,
        items: inlineDatasetItems,
        evaluationCriteria: [],
      };

      DatasetStorage.add(createdDataset);
      setDatasets((prev) => [...prev, createdDataset]);
      datasetForCampaign = createdDataset;
      datasetId = createdDataset.id;
      message.success(
        `Created new dataset with ${inlineDatasetItems.length} item(s).`
      );
    } else if (datasetSource === 'import-json') {
      if (importedItems.length === 0) {
        message.error(
          'Please import a JSON file containing at least one question-answer pair.'
        );
        return;
      }

      const createdAt = new Date().toISOString();
      const importedDatasetItems: TestItem[] = importedItems.map(
        (item, index) => ({
          id: item.id || `import_item_${Date.now()}_${index}`,
          type: 'qa',
          question: item.question,
          expectedAnswer: item.expectedAnswer,
          category: item.category,
          priority: DEFAULT_PRIORITY,
          difficulty: 'medium',
        })
      );

      const createdDataset: TestDataset = {
        id: `ds_import_${Date.now()}`,
        name: `${values.name || 'Campaign'} Imported Dataset`,
        description: 'Dataset created during campaign setup (JSON import).',
        type: 'qa',
        tags: [],
        itemCount: importedDatasetItems.length,
        version: '1.0',
        createdAt,
        updatedAt: createdAt,
        items: importedDatasetItems,
        evaluationCriteria: [],
      };

      DatasetStorage.add(createdDataset);
      setDatasets((prev) => [...prev, createdDataset]);
      datasetForCampaign = createdDataset;
      datasetId = createdDataset.id;
      message.success(
        `Imported dataset with ${importedDatasetItems.length} item(s).`
      );
    }

    if (!datasetId || !datasetForCampaign) {
      message.error('Dataset setup failed. Please double-check your inputs.');
      return;
    }

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

    const selectedChatbotId = values.chatbotId;

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: values.name,
      description: values.description || '',
      chatbotIds: selectedChatbotId ? [selectedChatbotId] : [],
      evaluationType: values.evaluationType || ['automated'],
      datasetId,
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

    finalizeCampaignCreation(newCampaign, datasetForCampaign, startImmediately);
  };

  const handleSubmit = (values: CampaignFormValues) => {
    handleCreateCampaign(values, false);
  };

  const handleSubmitAndRun = (values: CampaignFormValues) => {
    handleCreateCampaign(values, true);
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
            datasetSource: 'existing',
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
            title='Select Chatbot'
            style={{ marginBottom: 16 }}
          >
            <Form.Item
              name='chatbotId'
              rules={[
                {
                  required: true,
                  message: 'Please choose a chatbot to evaluate',
                },
              ]}
            >
              <Select
                placeholder='Choose a chatbot'
                size='large'
                allowClear
                showSearch
                optionFilterProp='label'
                optionLabelProp='label'
              >
                {chatbots.length === 0 && (
                  <Select.Option disabled value='' label='No chatbots found'>
                    No chatbots found. Seed data via storage utilities.
                  </Select.Option>
                )}
                {chatbots.map((chatbot) => {
                  const optionLabel = `${chatbot.name} (${chatbot.version})`;
                  return (
                    <Select.Option
                      key={chatbot.id}
                      value={chatbot.id}
                      label={optionLabel}
                    >
                      <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>
                          {optionLabel}
                        </span>
                        <span className='text-xs text-gray-600'>
                          {chatbot.description}
                        </span>
                      </div>
                    </Select.Option>
                  );
                })}
              </Select>
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

          <Card type='inner' title='Dataset'>
            <div className='space-y-6'>
              <Form.Item
                label='Dataset Source'
                name='datasetSource'
                rules={[
                  { required: true, message: 'Please choose dataset source' },
                ]}
              >
                <Radio.Group>
                  <Space direction='vertical'>
                    <Radio value='existing'>Use an existing dataset</Radio>
                    <Radio value='manual'>Add questions manually</Radio>
                    <Radio value='import-json'>Import from JSON file</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {datasetSourceWatch === 'existing' && (
                <Form.Item
                  name='datasetId'
                  label='Test Dataset'
                  rules={
                    datasetSourceWatch === 'existing'
                      ? [{ required: true, message: 'Please select a dataset' }]
                      : []
                  }
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
              )}

              {datasetSourceWatch === 'manual' && (
                <div className='space-y-4'>
                  <Alert
                    type='info'
                    showIcon
                    message='We’ll create a new dataset automatically from the questions you add below.'
                  />

                  <div className='p-4 border border-gray-200 rounded-lg space-y-4 bg-white shadow-sm'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Question
                        </label>
                        <Input
                          placeholder='Enter question to ask the chatbot'
                          value={inlineDraft.question}
                          onChange={(e) =>
                            setInlineDraft((prev) => ({
                              ...prev,
                              question: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Expected answer
                        </label>
                        <TextArea
                          rows={3}
                          placeholder='Describe the ideal chatbot reply'
                          value={inlineDraft.expectedAnswer}
                          onChange={(e) =>
                            setInlineDraft((prev) => ({
                              ...prev,
                              expectedAnswer: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Category (optional)
                        </label>
                        <Input
                          placeholder='e.g. Onboarding, Pricing, Support'
                          value={inlineDraft.category}
                          onChange={(e) =>
                            setInlineDraft((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className='flex justify-end'>
                      <Button type='dashed' onClick={handleAddInlineItem}>
                        Add question
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-800'>
                        {inlineItems.length} question(s) added
                      </span>
                      {inlineItems.length > 0 && (
                        <Button type='link' onClick={handleClearInlineItems}>
                          Clear all
                        </Button>
                      )}
                    </div>
                    {inlineItems.length === 0 ? (
                      <Alert
                        type='info'
                        showIcon
                        message='Add at least one question-answer pair to create a new dataset.'
                      />
                    ) : (
                      <div className='space-y-6 max-h-64 overflow-auto pr-1'>
                        {inlineItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className='space-y-3 rounded-lg border border-dashed border-gray-200 p-4 bg-gray-50 shadow-sm'
                          >
                            <Card
                              size='small'
                              className='border border-gray-200 shadow-sm bg-white'
                            >
                              <div className='flex justify-between gap-4'>
                                <div className='flex-1 space-y-2'>
                                  <div className='text-xs text-gray-500'>
                                    #{idx + 1}
                                    {item.category ? ` • ${item.category}` : ''}
                                  </div>
                                  <div className='font-semibold text-gray-900'>
                                    {item.question}
                                  </div>
                                  <div className='text-sm text-gray-700'>
                                    {item.expectedAnswer}
                                  </div>
                                </div>
                                <Button
                                  type='link'
                                  danger
                                  onClick={() =>
                                    handleRemoveInlineItem(item.id)
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {datasetSourceWatch === 'import-json' && (
                <div className='space-y-4'>
                  <div className='p-4 border border-dashed rounded-lg space-y-4 bg-gray-50'>
                    <div>
                      <p className='text-sm font-semibold text-gray-800'>
                        Expected JSON format
                      </p>
                      <pre className='mt-2 bg-white p-3 rounded text-xs text-gray-800 overflow-auto'>
                        {`[
  { "question": "How long is the trial?", "expectedAnswer": "30 days" },
  { "question": "Support hours?", "expectedAnswer": "24/7" }
]`}
                      </pre>
                      <p className='text-xs text-gray-600 mt-2'>
                        Tip: download a{' '}
                        <a
                          href='/samples/campaign-dataset-sample.json'
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          sample JSON template
                        </a>{' '}
                        to get started quickly.
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <input
                        id='campaign-import-json'
                        type='file'
                        accept='application/json'
                        className='hidden'
                        style={{ display: 'none' }}
                        ref={importFileInputRef}
                        onChange={(event) =>
                          handleImportJson(event.target.files?.[0] ?? null)
                        }
                      />
                      <Button
                        type='primary'
                        htmlType='button'
                        onClick={() => importFileInputRef.current?.click()}
                      >
                        Upload JSON file
                      </Button>
                      <span className='text-xs text-gray-600'>
                        {importedFileName
                          ? `Selected: ${importedFileName}`
                          : 'No file selected'}
                      </span>
                    </div>
                    {importError && (
                      <Alert type='error' showIcon message={importError} />
                    )}
                    {importedItems.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm text-gray-700'>
                          <span>
                            Imported {importedItems.length} question(s) from
                            file
                          </span>
                          <Button
                            type='link'
                            onClick={handleClearImportedItems}
                          >
                            Clear import
                          </Button>
                        </div>
                        <div className='max-h-56 overflow-auto space-y-4 pr-1'>
                          {importedItems.map((item, index) => (
                            <div
                              key={item.id}
                              className='rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 shadow-sm'
                            >
                              <div className='font-semibold text-gray-900 flex items-start justify-between gap-3'>
                                <span>#{index + 1}</span>
                                <span className='flex-1 text-left'>
                                  {item.question}
                                </span>
                              </div>
                              <div className='text-sm text-gray-700 mt-2'>
                                {item.expectedAnswer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

          <Form.Item style={{ marginTop: 24 }}>
            <Space size='middle'>
              <Button
                type='primary'
                htmlType='submit'
                icon={<SaveOutlined />}
                size='large'
              >
                Create Campaign
              </Button>
              <Button
                type='primary'
                size='large'
                onClick={() => {
                  form
                    .validateFields()
                    .then((values) => {
                      handleSubmitAndRun(values as CampaignFormValues);
                    })
                    .catch(() => {
                      /* validation handled by form */
                    });
                }}
              >
                Create & Run Campaign
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
