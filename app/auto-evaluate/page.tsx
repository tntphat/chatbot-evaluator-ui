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
} from '@/lib/mockLLMEvaluator';

const CRITERION_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  relevance: 'Relevance',
  coherence: 'Coherence',
  completeness: 'Completeness',
  clarity: 'Clarity',
  citations: 'Citations',
  tone: 'Tone',
};

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
  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    checkAccuracy: true,
    checkRelevance: true,
    checkCoherence: true,
    checkCompleteness: true,
    checkToxicity: false,
    checkHallucination: false,
  });

  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
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
  }, []);

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
    const dataset = datasets.find((d) => d.id === selectedDataset);
    if (!dataset || !dataset.items || dataset.items.length === 0) {
      alert('Please select a dataset with test items!');
      return;
    }

    setEvaluating(true);
    setProgress({ current: 0, total: dataset.items.length });
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
        criteria,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setResults(evaluationResults);
      setShowResults(true);
    } catch (error) {
      alert('Evaluation failed: ' + error);
    } finally {
      setEvaluating(false);
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

          <Card title='Step 2: Configure Evaluator Model'>
            <div className='space-y-3'>
              {evaluatorModels.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedEvaluator === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='evaluator'
                    value={model.id}
                    checked={selectedEvaluator === model.id}
                    onChange={(e) => setSelectedEvaluator(e.target.value)}
                    className='w-5 h-5 mt-1'
                    disabled={evaluating}
                  />
                  <div className='flex-1'>
                    <div className='font-bold text-gray-900'>{model.name}</div>
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
              ))}
            </div>
          </Card>

          <Card title='Step 3: Evaluation Criteria (Optional)'>
            <div className='space-y-3'>
              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkAccuracy}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkAccuracy: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>Accuracy</div>
                  <div className='text-sm text-gray-700'>
                    Compare actual answer with expected answer
                  </div>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkRelevance}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkRelevance: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>Relevance</div>
                  <div className='text-sm text-gray-700'>
                    Check if answer is relevant to the question
                  </div>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkCoherence}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkCoherence: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>Coherence</div>
                  <div className='text-sm text-gray-700'>
                    Evaluate logical flow and clarity
                  </div>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkCompleteness}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkCompleteness: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>
                    Completeness
                  </div>
                  <div className='text-sm text-gray-700'>
                    Check if answer covers all necessary information
                  </div>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkToxicity}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkToxicity: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>Toxicity</div>
                  <div className='text-sm text-gray-700'>
                    Detect harmful or inappropriate language
                  </div>
                </div>
              </label>

              <label className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5'
                  checked={criteria.checkHallucination}
                  onChange={(e) =>
                    setCriteria({
                      ...criteria,
                      checkHallucination: e.target.checked,
                    })
                  }
                  disabled={evaluating}
                />
                <div>
                  <div className='font-semibold text-gray-900'>
                    Hallucination
                  </div>
                  <div className='text-sm text-gray-700'>
                    Check for fabricated or unverified information
                  </div>
                </div>
              </label>
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
                  ([, detail]) => detail.score < 4 && Boolean(detail.reason)
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
                        ([key, detail]) => (
                          <div key={key} className='text-xs'>
                            <span className='text-gray-700'>
                              {CRITERION_LABELS[key] ?? key}:
                            </span>{' '}
                            <span className='font-semibold text-gray-900'>
                              {toPercentageDisplay(detail.score)}
                            </span>
                          </div>
                        )
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
                        ([key, detail]) => (
                          <div key={key}>
                            <div className='font-semibold text-gray-900'>
                              {CRITERION_LABELS[key] ?? key}
                            </div>
                            <div>{detail.reason}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
