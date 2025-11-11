'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DatasetStorage } from '@/lib/storage';
import type { TestDataset } from '@/lib/types';
import {
  batchEvaluate,
  getEvaluationSummary,
  type EvaluationCriteria,
  type AutoEvaluationResult,
  DEFAULT_CRITERIA_THRESHOLDS,
  DEFAULT_OVERALL_THRESHOLD,
} from '@/lib/mockLLMEvaluator';
import { AutoEvalHistoryStorage, CampaignStorage } from '@/lib/storage';
import Link from 'next/link';

type AutoEvalHistoryEntry = {
  id: string;
  timestamp: string;
  datasetId: string;
  datasetName: string;
  chatbotId: string;
  chatbotName: string;
  evaluator: string;
  mode: 'semantic' | 'criteria';
  totalTests: number;
  passRate: number;
  avgScore: number;
  criteria: EvaluationCriteria;
  results: AutoEvaluationResult[];
  campaignId?: string;
};

type RerunConfig = {
  datasetId: string;
  chatbotId: string;
  evaluator: string;
  mode: 'semantic' | 'criteria';
  criteria: EvaluationCriteria;
  campaignId?: string;
};

type MetricKey =
  | 'accuracy'
  | 'relevance'
  | 'coherence'
  | 'completeness'
  | 'toxicity'
  | 'hallucination';

const CRITERION_LABELS: Record<string, string> = {
  accuracy: 'Factuality',
  relevance: 'Task Fulfillment',
  coherence: 'Clarity & Coherence',
  completeness: 'Completeness',
  toxicity: 'Safety (Toxicity)',
  hallucination: 'Hallucination Risk',
};

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

const CRITERIA_CONTROL_CONFIG: Array<{
  key: MetricKey;
  flag: keyof EvaluationCriteria;
  title: string;
  description: string;
}> = [
  {
    key: 'accuracy',
    flag: 'checkAccuracy',
    title: 'Factuality (Accuracy)',
    description: 'Compare actual answer with expected answer',
  },
  {
    key: 'relevance',
    flag: 'checkRelevance',
    title: 'Task Fulfillment (Relevance)',
    description: 'Check if answer stays on-task with the prompt',
  },
  {
    key: 'coherence',
    flag: 'checkCoherence',
    title: 'Clarity & Coherence',
    description: 'Evaluate logical flow and clarity',
  },
  {
    key: 'completeness',
    flag: 'checkCompleteness',
    title: 'Completeness',
    description: 'Check if answer covers all necessary information',
  },
  {
    key: 'toxicity',
    flag: 'checkToxicity',
    title: 'Safety (Toxicity)',
    description: 'Detect harmful or inappropriate language',
  },
  {
    key: 'hallucination',
    flag: 'checkHallucination',
    title: 'Hallucination Risk',
    description: 'Check for fabricated or unverified information',
  },
];

type CriteriaTemplate = {
  id: string;
  name: string;
  description: string;
  value: EvaluationCriteria;
};

const CRITERIA_TEMPLATES: CriteriaTemplate[] = [
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

const SEMANTIC_ONLY_CRITERIA: EvaluationCriteria = mergeWithBaseCriteria({
  checkRelevance: false,
  checkCoherence: false,
  checkCompleteness: false,
  checkToxicity: false,
  checkHallucination: false,
});

const toPercentageDisplay = (score: number | null | undefined) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return '—';
  }

  const percentage = Math.round(score * 20 * 10) / 10; // convert 0-5 scale to 0-100 with 1 decimal
  return `${percentage}/100`;
};

export default function AutoEvaluatePage() {
  const [datasets, setDatasets] = useState<TestDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedChatbot, setSelectedChatbot] = useState<string>('');
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('gpt-4');
  const [lastLLMEvaluator, setLastLLMEvaluator] = useState<string>('gpt-4');
  const [evaluationMode, setEvaluationMode] = useState<'semantic' | 'criteria'>(
    'semantic'
  );
  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    ...BASE_CRITERIA_STATE,
  });

  const clampScore = (value: number) => Math.min(5, Math.max(1, value));

  const normalizeCriteria = (input: EvaluationCriteria): EvaluationCriteria => {
    const normalized: EvaluationCriteria = {
      ...BASE_CRITERIA_STATE,
      ...(input ?? {}),
    };
    (
      [
        'accuracy',
        'relevance',
        'coherence',
        'completeness',
        'toxicity',
        'hallucination',
      ] as MetricKey[]
    ).forEach((metric) => {
      const key = `${metric}Threshold` as keyof EvaluationCriteria;
      if (typeof normalized[key] !== 'number') {
        (normalized[key] as number | undefined) =
          DEFAULT_CRITERIA_THRESHOLDS[metric];
      }
    });
    if (typeof normalized.overallThreshold !== 'number') {
      normalized.overallThreshold = DEFAULT_OVERALL_THRESHOLD;
    }
    return normalized;
  };

  const getThresholdValue = (metric: MetricKey, value?: number): number => {
    if (typeof value === 'number') return value;
    return DEFAULT_CRITERIA_THRESHOLDS[metric];
  };

  const handleThresholdChange = (metric: MetricKey, value: number) => {
    const fallback = DEFAULT_CRITERIA_THRESHOLDS[metric];
    const clamped = clampScore(Number.isNaN(value) ? fallback : value);
    setCriteria((prev) => ({
      ...prev,
      [`${metric}Threshold`]: clamped,
    }));
  };

  const handleOverallThresholdChange = (value: number) => {
    const clamped = clampScore(
      Number.isNaN(value) ? DEFAULT_OVERALL_THRESHOLD : value
    );
    setCriteria((prev) => ({
      ...prev,
      overallThreshold: clamped,
    }));
  };

  const applyTemplate = (template: EvaluationCriteria) => {
    setCriteria(normalizeCriteria(template));
  };

  const [history, setHistory] = useState<AutoEvalHistoryEntry[]>([]);
  const [pendingRerunConfig, setPendingRerunConfig] =
    useState<RerunConfig | null>(null);
  const [autoRerunTriggered, setAutoRerunTriggered] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [progressDetail, setProgressDetail] = useState<{
    current: number;
    total: number;
    question: string;
    expectedAnswer: string;
    actualAnswer: string;
  } | null>(null);
  const [results, setResults] = useState<AutoEvaluationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Mock chatbots list
  const mockChatbots = [
    {
      id: 'bot_001',
      name: 'HR Assistant Bot v2.3',
      model: 'GPT-3.5-turbo fine-tuned',
    },
    { id: 'bot_002', name: 'HR Assistant Bot v2.2', model: 'GPT-3.5-turbo' },
    { id: 'bot_003', name: 'Customer Support Bot v1.0', model: 'GPT-4' },
  ];

  // Evaluator models
  const evaluatorModels = [
    {
      id: 'gpt-4',
      name: 'GPT-4 (OpenAI)',
      description: 'Best for comprehensive evaluation',
      features: ['Excellent reasoning', 'Widely tested', 'Reliable'],
      speed: '5-8 mins per 100 questions',
      cost: '$3.75',
    },
    {
      id: 'claude-3.5',
      name: 'Claude 3.5 Sonnet (Anthropic)',
      description: 'Best for detailed reasoning',
      features: ['Strong analysis', 'Long context', 'Detailed explanations'],
      speed: '6-10 mins per 100 questions',
      cost: '$3.75',
    },
    {
      id: 'gpt-3.5',
      name: 'GPT-3.5-turbo (OpenAI)',
      description: 'Budget option for quick tests',
      features: ['Fast', 'Cheap', 'Good for smoke tests'],
      speed: '3-5 mins per 100 questions',
      cost: '$0.75',
    },
    {
      id: 'embedding',
      name: 'Embedding-based (Semantic Similarity)',
      description: 'Fast factual checks',
      features: ['Very fast', 'Cheapest', 'Good for basic similarity'],
      speed: '1-2 mins per 100 questions',
      cost: '$0.10',
    },
  ];

  useEffect(() => {
    setDatasets(DatasetStorage.getAll() as TestDataset[]);
    setHistory(AutoEvalHistoryStorage.getAll() as AutoEvalHistoryEntry[]);
  }, []);

  useEffect(() => {
    if (datasets.length === 0) return;
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('auto_eval_rerun_config');
    if (!stored) return;
    window.localStorage.removeItem('auto_eval_rerun_config');
    try {
      const config: RerunConfig = JSON.parse(stored);
      if (config.datasetId) {
        setSelectedDataset(config.datasetId);
      }
      if (config.chatbotId) {
        setSelectedChatbot(config.chatbotId);
      }
      setEvaluationMode(config.mode || 'semantic');
      if (config.mode === 'criteria' && config.criteria) {
        setCriteria(normalizeCriteria(config.criteria));
        if (config.evaluator) {
          setSelectedEvaluator(config.evaluator);
          setLastLLMEvaluator(config.evaluator);
        }
      } else {
        if (config.evaluator) {
          setLastLLMEvaluator(config.evaluator);
        }
        setSelectedEvaluator('embedding');
      }
      setActiveCampaignId(config.campaignId ?? null);
      setPendingRerunConfig(config);
    } catch (error) {
      console.error('Failed to parse rerun config', error);
    }
  }, [datasets.length]);

  useEffect(() => {
    if (!pendingRerunConfig) return;
    if (autoRerunTriggered) return;
    if (!selectedDataset || !selectedChatbot) return;
    if (pendingRerunConfig.datasetId !== selectedDataset) return;
    if (pendingRerunConfig.chatbotId !== selectedChatbot) return;
    if (evaluating) return;
    setAutoRerunTriggered(true);
    setPendingRerunConfig(null);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleStartEvaluation();
  }, [
    pendingRerunConfig,
    selectedDataset,
    selectedChatbot,
    evaluating,
    autoRerunTriggered,
  ]);

  useEffect(() => {
    if (evaluationMode === 'semantic') {
      if (selectedEvaluator !== 'embedding') {
        if (selectedEvaluator) {
          setLastLLMEvaluator(selectedEvaluator);
        }
        setSelectedEvaluator('embedding');
      }
    } else if (evaluationMode === 'criteria') {
      if (selectedEvaluator === 'embedding') {
        setSelectedEvaluator(lastLLMEvaluator || 'gpt-4');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationMode]);

  const generateMockAnswer = (expectedAnswer: string): string => {
    // Mock: generate slightly varied answers to simulate chatbot responses
    const variations = [
      expectedAnswer, // Exact match (good)
      expectedAnswer.substring(0, expectedAnswer.length - 10) + '...', // Incomplete
      expectedAnswer.split(' ').slice(0, -2).join(' '), // Missing words
      'I can help you with that. ' + expectedAnswer, // Extra politeness
      expectedAnswer.replace(/\.$/, '') +
        ', let me know if you need more help!', // More info
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  };

  const handleStartEvaluation = async () => {
    const campaignIdForRun = activeCampaignId;
    const dataset = datasets.find((d) => d.id === selectedDataset);
    if (!dataset || !dataset.items || dataset.items.length === 0) {
      alert('Please select a dataset with test items!');
      return;
    }

    const appliedCriteria = normalizeCriteria(
      evaluationMode === 'semantic'
        ? { ...SEMANTIC_ONLY_CRITERIA }
        : { ...criteria }
    );

    setEvaluating(true);
    setProgress({ current: 0, total: dataset.items.length });
    setProgressDetail(null);
    setResults([]);
    setShowResults(false);

    try {
      // Prepare items for evaluation
      const itemsToEvaluate = dataset.items.map((item) => ({
        question: item.question || '',
        expectedAnswer: item.expectedAnswer || '',
        actualAnswer: generateMockAnswer(item.expectedAnswer || ''),
      }));

      // Run batch evaluation
      const evaluationResults = await batchEvaluate(
        itemsToEvaluate,
        appliedCriteria,
        (current, total, item) => {
          setProgress({ current, total });
          setProgressDetail({
            current,
            total,
            question: item.question,
            expectedAnswer: item.expectedAnswer,
            actualAnswer: item.actualAnswer,
          });
        }
      );

      const summaryData = getEvaluationSummary(evaluationResults);
      const datasetName = dataset.name;
      const chatbotName =
        mockChatbots.find((bot) => bot.id === selectedChatbot)?.name ||
        selectedChatbot ||
        'Unknown Bot';

      const entry: AutoEvalHistoryEntry = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        datasetId: dataset.id,
        datasetName,
        chatbotId: selectedChatbot,
        chatbotName,
        evaluator: selectedEvaluator,
        mode: evaluationMode,
        totalTests: summaryData.totalTests,
        passRate: summaryData.passRate ?? 0,
        avgScore: summaryData.averageScore ?? 0,
        criteria: appliedCriteria,
        results: evaluationResults,
        campaignId: campaignIdForRun ?? undefined,
      };

      AutoEvalHistoryStorage.add(entry);
      setHistory((prev) => [entry, ...prev]);

      if (entry.campaignId) {
        const resultsForCampaign = {
          totalTests: summaryData.totalTests,
          passedTests: summaryData.passed,
          failedTests: summaryData.failed,
          passRate: summaryData.passRate ?? 0,
          avgAccuracy: entry.avgScore,
          avgResponseTime: 0,
          avgQualityScore: entry.avgScore,
          taskCompletionRate: summaryData.passRate ?? 0,
          errorRate: Math.max(0, 100 - (summaryData.passRate ?? 0)),
        };
        CampaignStorage.update(entry.campaignId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          progress: 100,
          results: resultsForCampaign,
        });
      }

      setResults(evaluationResults);
      setShowResults(true);
    } catch (error) {
      alert('Evaluation failed: ' + error);
    } finally {
      setEvaluating(false);
      setProgressDetail(null);
      setProgress({ current: 0, total: 0 });
      setActiveCampaignId(null);
    }
  };

  const summary = useMemo(
    () => (showResults ? getEvaluationSummary(results) : null),
    [showResults, results]
  );

  const derivedMetrics = useMemo(() => {
    if (results.length === 0) {
      return {
        avgOverallScore: 0,
        avgAccuracy: null as number | null,
        topIssues: [] as Array<{ issue: string; count: number }>,
      };
    }

    const totalOverallScore = results.reduce(
      (acc, result) => acc + (result.overallScore || 0),
      0
    );

    const accuracyScores = results
      .map((result) => result.criteriaResults?.accuracy?.score)
      .filter((score): score is number => typeof score === 'number');

    const issuesCounter: Record<string, number> = {};

    results.forEach((result) => {
      Object.values(result.criteriaResults || {}).forEach((detail) => {
        if (detail.score < 4 && detail.reason) {
          issuesCounter[detail.reason] =
            (issuesCounter[detail.reason] || 0) + 1;
        }
      });
    });

    const topIssues = Object.entries(issuesCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));

    return {
      avgOverallScore:
        Math.round((totalOverallScore / results.length) * 10) / 10,
      avgAccuracy:
        accuracyScores.length > 0
          ? Math.round(
              (accuracyScores.reduce((acc, score) => acc + score, 0) /
                accuracyScores.length) *
                10
            ) / 10
          : null,
      topIssues,
    };
  }, [results]);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Automatic Evaluation (LLM)
        </h1>
        <p className='mt-2 text-gray-800'>
          Use AI to automatically evaluate chatbot responses against expected
          answers
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <div className='bg-blue-50 border-2 border-blue-200 rounded-lg p-4'>
          <h3 className='font-bold text-gray-900 mb-2'>
            🤖 How it works (MVP Demo)
          </h3>
          <p className='text-sm text-gray-800'>
            This demo simulates LLM-based evaluation. In production, this would:
          </p>
          <ul className='list-disc ml-6 mt-2 text-sm text-gray-800 space-y-1'>
            <li>Call GPT-4, Claude, or other LLM APIs</li>
            <li>Send: question + expected answer + actual answer + criteria</li>
            <li>Receive: scores, reasoning, detected issues</li>
            <li>Compare using embeddings, BERT score, semantic similarity</li>
          </ul>
          <p className='text-sm text-gray-800 mt-2'>
            <strong>For now:</strong> Mock responses are generated to
            demonstrate the evaluation flow.
          </p>
        </div>
      </Card>

      {/* Configuration */}
      {!showResults && (
        <>
          <Card title='Step 1: Select Test Suite & Chatbot'>
            <div className='space-y-4'>
              {/* Test Suite Selection */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Test Suite
                </label>
                <select
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  disabled={evaluating}
                >
                  <option value=''>-- Select a test suite --</option>
                  {datasets.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.itemCount} questions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Chatbot Selection */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Chatbot to Evaluate
                </label>
                <select
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  value={selectedChatbot}
                  onChange={(e) => setSelectedChatbot(e.target.value)}
                  disabled={evaluating}
                >
                  <option value=''>-- Select a chatbot --</option>
                  {mockChatbots.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name} ({bot.model})
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-600 mt-2'>
                  💡 In production, this would test your live chatbot. For demo,
                  we generate mock responses.
                </p>
              </div>
            </div>
          </Card>

          <Card title='Step 2: Choose Evaluation Mode'>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <label
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    evaluationMode === 'semantic'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <input
                      type='radio'
                      name='evaluation-mode'
                      value='semantic'
                      checked={evaluationMode === 'semantic'}
                      onChange={() => setEvaluationMode('semantic')}
                      className='w-5 h-5 mt-1'
                      disabled={evaluating}
                    />
                    <div>
                      <div className='font-bold text-gray-900 mb-1'>
                        ⚡ Quick Semantic Compare
                      </div>
                      <p className='text-sm text-gray-700'>
                        Run embedding similarity against ground truth. Fast,
                        cheap, and requires no extra configuration.
                      </p>
                      <div className='mt-2 flex flex-wrap gap-2'>
                        <Badge variant='info' size='sm'>
                          Embedding-based
                        </Badge>
                        <Badge variant='success' size='sm'>
                          Lowest cost
                        </Badge>
                        <Badge variant='neutral' size='sm'>
                          Accuracy only
                        </Badge>
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    evaluationMode === 'criteria'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <input
                      type='radio'
                      name='evaluation-mode'
                      value='criteria'
                      checked={evaluationMode === 'criteria'}
                      onChange={() => setEvaluationMode('criteria')}
                      className='w-5 h-5 mt-1'
                      disabled={evaluating}
                    />
                    <div>
                      <div className='font-bold text-gray-900 mb-1'>
                        🧠 LLM Criteria Compare
                      </div>
                      <p className='text-sm text-gray-700'>
                        Uses evaluator LLM to score multiple criteria and spot
                        issues.
                      </p>
                      <div className='mt-2 flex flex-wrap gap-2'>
                        <Badge variant='info' size='sm'>
                          LLM required
                        </Badge>
                        <Badge variant='warning' size='sm'>
                          Configurable
                        </Badge>
                        <Badge variant='neutral' size='sm'>
                          Richer insights
                        </Badge>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {evaluationMode === 'semantic' ? (
                <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700'>
                  ⚡ Semantic compare selected — we will compute embedding
                  similarity between actual and expected answers and report an
                  accuracy score.
                </div>
              ) : (
                <div className='space-y-3'>
                  <p className='text-sm text-gray-700'>
                    Select the criteria you want the evaluator LLM to score:
                  </p>

                  <div className='grid gap-3 sm:grid-cols-3'>
                    {CRITERIA_TEMPLATES.map((template) => {
                      const isActive = CRITERIA_FLAG_KEYS.every(
                        (flag) => criteria[flag] === template.value[flag]
                      );
                      return (
                        <button
                          key={template.id}
                          type='button'
                          onClick={() => applyTemplate(template.value)}
                          disabled={evaluating}
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

                  <div className='flex flex-wrap items-center gap-3 p-3 border border-dashed border-purple-300 rounded-lg bg-purple-50/40'>
                    <span className='text-sm font-medium text-purple-900'>
                      Overall pass threshold
                    </span>
                    <input
                      type='number'
                      min='1'
                      max='5'
                      step='0.1'
                      value={
                        typeof criteria.overallThreshold === 'number'
                          ? criteria.overallThreshold
                          : DEFAULT_OVERALL_THRESHOLD
                      }
                      onChange={(e) =>
                        handleOverallThresholdChange(parseFloat(e.target.value))
                      }
                      disabled={evaluating}
                      className='w-20 px-2 py-1 border border-purple-300 rounded text-xs'
                    />
                    <span className='text-xs text-purple-700'>
                      Score out of 5 required for a response to pass overall
                    </span>
                  </div>

                  <div className='space-y-3'>
                    {CRITERIA_CONTROL_CONFIG.map(
                      ({ key, flag, title, description }) => {
                        const checked = Boolean(criteria[flag]);
                        const thresholdKey = `${key}Threshold`;
                        const criteriaThreshold =
                          criteria[thresholdKey as keyof EvaluationCriteria];
                        const thresholdValue = getThresholdValue(
                          key,
                          typeof criteriaThreshold === 'number'
                            ? criteriaThreshold
                            : undefined
                        );
                        return (
                          <label
                            key={key}
                            className='flex gap-3 p-3 hover:bg-gray-50 rounded border border-transparent transition cursor-pointer'
                          >
                            <input
                              type='checkbox'
                              className='w-5 h-5 mt-1 flex-shrink-0'
                              checked={checked}
                              onChange={(e) =>
                                setCriteria((prev) => {
                                  const keyName =
                                    `${key}Threshold` as keyof EvaluationCriteria;
                                  let next: EvaluationCriteria = {
                                    ...prev,
                                    [flag]: e.target.checked,
                                  };
                                  if (e.target.checked) {
                                    const currentThreshold = next[keyName];
                                    if (typeof currentThreshold !== 'number') {
                                      next = {
                                        ...next,
                                        [keyName]:
                                          DEFAULT_CRITERIA_THRESHOLDS[key],
                                      };
                                    }
                                  }
                                  return next;
                                })
                              }
                              disabled={evaluating}
                            />
                            <div className='flex-1'>
                              <div className='flex items-center justify-between gap-3'>
                                <div>
                                  <div className='font-semibold text-gray-900'>
                                    {title}
                                  </div>
                                  <div className='text-sm text-gray-700'>
                                    {description}
                                  </div>
                                </div>
                                <div className='flex items-center gap-2 text-xs text-gray-600'>
                                  <span>Accept score ≥</span>
                                  <input
                                    type='number'
                                    min='1'
                                    max='5'
                                    step='0.1'
                                    value={thresholdValue}
                                    onChange={(e) =>
                                      handleThresholdChange(
                                        key,
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    disabled={!checked || evaluating}
                                    className='w-16 px-2 py-1 border border-gray-300 rounded text-xs'
                                  />
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title='Step 3: Configure Evaluator Model'>
            <div className='space-y-3'>
              {evaluatorModels.map((model) => {
                const isSemanticMode = evaluationMode === 'semantic';
                const isDisabled = isSemanticMode && model.id !== 'embedding';
                const isSelected = selectedEvaluator === model.id;
                return (
                  <label
                    key={model.id}
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type='radio'
                      name='evaluator'
                      value={model.id}
                      checked={isSelected}
                      onChange={(e) => {
                        setSelectedEvaluator(e.target.value);
                        if (e.target.value !== 'embedding') {
                          setLastLLMEvaluator(e.target.value);
                        }
                      }}
                      className='w-5 h-5 mt-1'
                      disabled={evaluating || isDisabled}
                    />
                    <div className='flex-1'>
                      <div className='font-bold text-gray-900'>
                        {model.name}
                      </div>
                      <div className='text-sm text-gray-700 mb-2'>
                        {model.description}
                      </div>
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {model.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded'
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className='flex justify-between text-xs text-gray-600'>
                        <span>⏱️ {model.speed}</span>
                        <span className='font-semibold'>
                          💰 Est. cost: {model.cost}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card title='Step 4: Start Evaluation'>
            <div className='space-y-4'>
              {!selectedDataset && (
                <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800'>
                  ⚠️ Please select a test suite first
                </div>
              )}
              {!selectedChatbot && selectedDataset && (
                <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800'>
                  ⚠️ Please select a chatbot to evaluate
                </div>
              )}
              {evaluationMode === 'semantic' ? (
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800'>
                  ⚡ Semantic compare enabled — embedding similarity only.
                </div>
              ) : (
                <div className='p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800'>
                  🧠 LLM criteria evaluation enabled — make sure evaluator model
                  and criteria are configured.
                </div>
              )}
              <Button
                className='w-full'
                size='lg'
                onClick={handleStartEvaluation}
                disabled={!selectedDataset || !selectedChatbot || evaluating}
              >
                {evaluating
                  ? `🔄 Evaluating... ${progress.current}/${progress.total}`
                  : '🚀 Start Automatic Evaluation'}
              </Button>
            </div>
          </Card>

          {evaluating && (
            <Card title='Evaluation In Progress'>
              <div className='space-y-4'>
                <div>
                  <div className='text-sm font-semibold text-gray-800 mb-1'>
                    Progress
                  </div>
                  <div className='w-full bg-gray-200 h-2 rounded-full'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all'
                      style={{
                        width:
                          progress.total > 0
                            ? `${Math.min(
                                100,
                                Math.round(
                                  (progress.current / progress.total) * 100
                                )
                              )}%`
                            : '0%',
                      }}
                    ></div>
                  </div>
                  <div className='text-xs text-gray-600 mt-1'>
                    {progress.current} / {progress.total} items
                  </div>
                </div>

                {progressDetail && (
                  <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3'>
                    <div className='text-xs text-gray-600'>
                      Item {progressDetail.current} of {progressDetail.total}
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-900'>
                        Question
                      </div>
                      <p className='text-sm text-gray-800 whitespace-pre-wrap mb-0'>
                        {progressDetail.question || '—'}
                      </p>
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-900'>
                        Expected Answer
                      </div>
                      <p className='text-sm text-gray-700 whitespace-pre-wrap mb-0'>
                        {progressDetail.expectedAnswer || '—'}
                      </p>
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-900'>
                        Chatbot Response (sampled)
                      </div>
                      <p className='text-sm text-gray-700 whitespace-pre-wrap mb-0'>
                        {progressDetail.actualAnswer || '—'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Results */}
      {showResults && summary && (
        <>
          <Card title='Evaluation Summary'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='text-3xl font-bold text-blue-600'>
                  {summary.totalTests}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Total Items</div>
              </div>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='text-3xl font-bold text-green-600'>
                  {summary.passed}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Passed</div>
              </div>
              <div className='text-center p-4 bg-red-50 rounded-lg'>
                <div className='text-3xl font-bold text-red-600'>
                  {summary.failed}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Failed</div>
              </div>
              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <div className='text-3xl font-bold text-purple-600'>
                  {Number.isFinite(summary.passRate)
                    ? `${
                        summary.passRate % 1 === 0
                          ? summary.passRate
                          : summary.passRate.toFixed(1)
                      }%`
                    : '—'}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Pass Rate</div>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 border border-gray-300 rounded-lg'>
                <div className='text-sm font-semibold text-gray-700 mb-2'>
                  Average Overall Score
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {toPercentageDisplay(derivedMetrics.avgOverallScore)}
                </div>
              </div>
              <div className='p-4 border border-gray-300 rounded-lg'>
                <div className='text-sm font-semibold text-gray-700 mb-2'>
                  Average Accuracy
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {toPercentageDisplay(derivedMetrics.avgAccuracy)}
                </div>
              </div>
            </div>

            {derivedMetrics.topIssues.length > 0 && (
              <div className='mt-6'>
                <div className='text-sm font-semibold text-gray-700 mb-3'>
                  Most Common Improvement Areas:
                </div>
                <div className='space-y-2'>
                  {derivedMetrics.topIssues.map((item, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded'
                    >
                      <span className='text-sm text-gray-900'>
                        {item.issue}
                      </span>
                      <Badge variant='error' size='sm'>
                        {item.count} times
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='mt-6 flex gap-3'>
              <Button
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                }}
              >
                ← Run Another Evaluation
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  const dataStr = JSON.stringify(
                    {
                      summary,
                      results,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2
                  );
                  const blob = new Blob([dataStr], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `evaluation_results_${Date.now()}.json`;
                  a.click();
                }}
              >
                📥 Export Results
              </Button>
            </div>
          </Card>

          <Card
            title='Detailed Results'
            subtitle={`${results.length} items evaluated`}
          >
            <div className='space-y-4 max-h-[600px] overflow-y-auto'>
              {results.map((result, idx) => {
                const issueEntries = Object.entries(
                  result.criteriaResults || {}
                ).filter(
                  ([, detail]) =>
                    detail.score <
                      (typeof detail.threshold === 'number'
                        ? detail.threshold
                        : 4) && Boolean(detail.reason)
                );

                return (
                  <div
                    key={idx}
                    className={`p-4 border-2 rounded-lg ${
                      result.passed
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <span className='text-sm font-bold text-gray-700'>
                        Item #{idx + 1}
                      </span>
                      <div className='flex gap-2 items-center'>
                        <Badge
                          variant={result.passed ? 'success' : 'error'}
                          size='sm'
                        >
                          {result.passed ? '✓ PASSED' : '✗ FAILED'}
                        </Badge>
                        <Badge variant='neutral' size='sm'>
                          Score: {toPercentageDisplay(result.overallScore)}
                        </Badge>
                      </div>
                    </div>

                    <div className='space-y-1 text-xs text-gray-800 mb-3'>
                      <div>
                        <span className='font-semibold text-gray-900'>
                          Question:
                        </span>{' '}
                        {result.question || '—'}
                      </div>
                      <div>
                        <span className='font-semibold text-gray-900'>
                          Expected:
                        </span>{' '}
                        {result.expectedAnswer || '—'}
                      </div>
                      <div>
                        <span className='font-semibold text-gray-900'>
                          Actual:
                        </span>{' '}
                        {result.actualAnswer || '—'}
                      </div>
                    </div>

                    {/* Detailed scores */}
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mb-3'>
                      {Object.entries(result.criteriaResults || {}).map(
                        ([key, detail]) => {
                          const threshold =
                            typeof detail.threshold === 'number'
                              ? detail.threshold
                              : undefined;
                          const passed = detail.passed !== false;
                          return (
                            <div key={key} className='text-xs'>
                              <div className='flex items-center justify-between gap-2'>
                                <span className='text-gray-700'>
                                  {CRITERION_LABELS[key] ?? key}
                                </span>
                                <div className='flex items-center gap-1'>
                                  {threshold !== undefined && (
                                    <Badge
                                      variant={passed ? 'success' : 'error'}
                                      size='sm'
                                    >
                                      {passed ? '≥' : '<'}{' '}
                                      {threshold.toFixed(1)}
                                    </Badge>
                                  )}
                                  <span className='font-semibold text-gray-900'>
                                    {toPercentageDisplay(detail.score)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {issueEntries.length > 0 && (
                      <div className='mb-3'>
                        <div className='text-xs font-semibold text-gray-700 mb-1'>
                          Improvement Suggestions:
                        </div>
                        <ul className='list-disc ml-5 text-xs text-gray-800 space-y-1'>
                          {issueEntries.map(([key, detail]) => (
                            <li key={key}>{detail.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className='p-3 bg-white border border-gray-300 rounded text-xs text-gray-800 space-y-2'>
                      {Object.entries(result.criteriaResults || {}).map(
                        ([key, detail]) => {
                          const threshold =
                            typeof detail.threshold === 'number'
                              ? detail.threshold
                              : undefined;
                          const passed = detail.passed !== false;
                          return (
                            <div key={key}>
                              <div className='flex items-center justify-between'>
                                <div className='font-semibold text-gray-900'>
                                  {CRITERION_LABELS[key] ?? key}
                                </div>
                                <div className='text-xs text-gray-600'>
                                  Score:{' '}
                                  <span className='font-semibold text-gray-900'>
                                    {toPercentageDisplay(detail.score)}
                                  </span>
                                  {threshold !== undefined && (
                                    <span className='ml-2'>
                                      (min {threshold.toFixed(1)})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`${
                                  passed ? 'text-gray-700' : 'text-red-600'
                                }`}
                              >
                                {detail.reason}
                              </div>
                              {!passed && (
                                <div className='text-xs text-red-600 font-semibold mt-1'>
                                  Below threshold — flagged for review.
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <Card title='Evaluation History'>
        {history.length === 0 ? (
          <p className='text-sm text-gray-600 m-0'>
            No evaluation history yet. Run an evaluation to see it here.
          </p>
        ) : (
          <div className='space-y-3'>
            {history.map((entry) => (
              <div
                key={entry.id}
                className='p-4 border border-gray-200 rounded-lg bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3'
              >
                <div>
                  <div className='font-semibold text-gray-900'>
                    {entry.datasetName}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {entry.chatbotName} ·{' '}
                    {new Date(entry.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className='flex flex-wrap gap-2 items-center'>
                  <Badge
                    variant={entry.mode === 'semantic' ? 'info' : 'warning'}
                  >
                    {entry.mode === 'semantic' ? 'Semantic' : 'LLM Criteria'}
                  </Badge>
                  <Badge variant='neutral'>Evaluator: {entry.evaluator}</Badge>
                  <Badge variant='success'>Pass Rate: {entry.passRate}%</Badge>
                  <Badge variant='neutral'>Avg Score: {entry.avgScore}</Badge>
                  <span className='text-sm text-gray-600'>
                    Tests: {entry.totalTests}
                  </span>
                  <Link
                    href={`/auto-evaluate/history/${entry.id}`}
                    className='text-sm text-blue-600 hover:underline'
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
