'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AutoEvalHistoryStorage } from '@/lib/storage';
import {
  DEFAULT_CRITERIA_THRESHOLDS,
  DEFAULT_OVERALL_THRESHOLD,
  type AutoEvaluationResult,
  type EvaluationCriteria,
} from '@/lib/mockLLMEvaluator';

type MetricKey =
  | 'accuracy'
  | 'relevance'
  | 'coherence'
  | 'completeness'
  | 'toxicity'
  | 'hallucination';

const METRIC_KEYS: MetricKey[] = [
  'accuracy',
  'relevance',
  'coherence',
  'completeness',
  'toxicity',
  'hallucination',
];

const normalizeCriteria = (
  criteria?: EvaluationCriteria
): EvaluationCriteria => {
  const base: EvaluationCriteria = {
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

  const merged: EvaluationCriteria = {
    ...base,
    ...(criteria ?? {}),
  };

  METRIC_KEYS.forEach((metric) => {
    const key = `${metric}Threshold` as keyof EvaluationCriteria;
    if (typeof merged[key] !== 'number') {
      (merged[key] as number | undefined) =
        DEFAULT_CRITERIA_THRESHOLDS[metric];
    }
  });

  if (typeof merged.overallThreshold !== 'number') {
    merged.overallThreshold = DEFAULT_OVERALL_THRESHOLD;
  }

  return merged;
};

const FALLBACK_CRITERIA = normalizeCriteria();

interface HistoryEntry {
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
}

const CRITERION_LABELS: Record<string, string> = {
  accuracy: 'Factuality',
  relevance: 'Task Fulfillment',
  coherence: 'Clarity & Coherence',
  completeness: 'Completeness',
  toxicity: 'Safety (Toxicity)',
  hallucination: 'Hallucination Risk',
};

const toPercentageDisplay = (score: number | null | undefined) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return '—';
  }

  const percentage = Math.round(score * 20 * 10) / 10;
  return `${percentage}/100`;
};

export default function AutoEvalHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const historyId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [entry, setEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    if (!historyId) return;
    const stored = AutoEvalHistoryStorage.getById(historyId) as
      | HistoryEntry
      | null
      | undefined;
    if (!stored) {
      setEntry(null);
    } else {
      setEntry(stored);
    }
  }, [historyId]);

  const handleRerun = () => {
    if (!entry) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'auto_eval_rerun_config',
        JSON.stringify({
          datasetId: entry.datasetId,
          chatbotId: entry.chatbotId,
          evaluator: entry.evaluator,
          mode: entry.mode,
          criteria: normalizeCriteria(entry.criteria),
          campaignId: entry.campaignId,
        })
      );
    }
    router.push('/auto-evaluate');
  };

  if (!entry) {
    return (
      <div className='space-y-4'>
        <Card>
          <p className='text-sm text-gray-700 mb-4'>
            Evaluation history entry not found.
          </p>
          <Link href='/auto-evaluate'>
            <Button>← Back to Auto Evaluate</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const appliedCriteria = normalizeCriteria(entry.criteria);

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Auto Evaluation Run
          </h1>
          <p className='mt-2 text-gray-700'>
            {new Date(entry.timestamp).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/auto-evaluate'>
            <Button variant='ghost'>← Back</Button>
          </Link>
          <Button onClick={handleRerun}>🔁 Rerun Evaluation</Button>
        </div>
      </div>

      <Card title='Summary'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 bg-gray-50 rounded-lg space-y-1'>
            <div className='text-sm text-gray-600'>Dataset</div>
            <div className='font-semibold text-gray-900'>
              {entry.datasetName}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg space-y-1'>
            <div className='text-sm text-gray-600'>Chatbot</div>
            <div className='font-semibold text-gray-900'>
              {entry.chatbotName}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg space-y-1'>
            <div className='text-sm text-gray-600'>Evaluator</div>
            <div className='font-semibold text-gray-900'>{entry.evaluator}</div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg space-y-1'>
            <div className='text-sm text-gray-600'>Mode</div>
            <Badge variant={entry.mode === 'semantic' ? 'info' : 'warning'}>
              {entry.mode === 'semantic' ? 'Semantic Compare' : 'LLM Criteria'}
            </Badge>
          </div>
          {entry.campaignId && (
            <div className='p-4 bg-gray-50 rounded-lg space-y-1'>
              <div className='text-sm text-gray-600'>Campaign</div>
              <Link
                href={`/campaigns/${entry.campaignId}`}
                className='font-semibold text-blue-600 hover:underline'
              >
                View Campaign →
              </Link>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <div className='text-3xl font-bold text-blue-600'>
              {entry.totalTests}
            </div>
            <div className='text-sm text-gray-700 mt-1'>Total Items</div>
          </div>
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <div className='text-3xl font-bold text-green-600'>
              {entry.passRate}%
            </div>
            <div className='text-sm text-gray-700 mt-1'>Pass Rate</div>
          </div>
          <div className='text-center p-4 bg-purple-50 rounded-lg'>
            <div className='text-3xl font-bold text-purple-600'>
              {entry.avgScore}/5.0
            </div>
            <div className='text-sm text-gray-700 mt-1'>Average Score</div>
          </div>
        </div>

        <div className='mt-4 p-4 bg-purple-50/60 border border-purple-200 rounded-lg'>
          <div className='text-sm font-semibold text-purple-900'>
            Overall Pass Threshold
          </div>
          <div className='text-xl font-bold text-purple-800'>
            {(
              appliedCriteria.overallThreshold ?? DEFAULT_OVERALL_THRESHOLD
            ).toFixed(1)}
            /5.0
          </div>
          <div className='text-xs text-purple-700 mt-1'>
            Responses must meet or exceed this overall score and all per-metric
            thresholds to pass.
          </div>
        </div>
      </Card>

      <Card title='Detailed Results'>
        <div className='space-y-4 max-h-[70vh] overflow-y-auto'>
          {entry.results.map((result, idx) => {
            const criteriaEntries = Object.entries(
              result.criteriaResults || {}
            );
            return (
              <div
                key={`${result.question}-${idx}`}
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

                <div className='space-y-2 text-sm text-gray-800 mb-3'>
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
                      Response:
                    </span>{' '}
                    {result.actualAnswer || '—'}
                  </div>
                </div>

                {criteriaEntries.length > 0 && (
                  <div className='p-3 bg-white border border-gray-300 rounded text-xs text-gray-800 space-y-2'>
                    {criteriaEntries.map(([key, detail]) => {
                      const criteriaThreshold = appliedCriteria[
                        `${key}Threshold` as keyof EvaluationCriteria
                      ];
                      const threshold =
                        typeof detail.threshold === 'number'
                          ? detail.threshold
                          : typeof criteriaThreshold === 'number'
                          ? criteriaThreshold
                          : DEFAULT_CRITERIA_THRESHOLDS[key as MetricKey];
                      const passed =
                        detail.passed ?? detail.score >= (threshold ?? 4);
                      return (
                        <div key={key}>
                          <div className='flex items-center justify-between'>
                            <div className='font-semibold text-gray-900'>
                              {CRITERION_LABELS[key] ?? key}
                            </div>
                            <div className='flex items-center gap-2'>
                              {threshold !== undefined && (
                                <Badge
                                  variant={passed ? 'success' : 'error'}
                                  size='sm'
                                >
                                  {passed ? '≥' : '<'} {threshold.toFixed(1)}
                                </Badge>
                              )}
                              <span className='font-semibold text-gray-900'>
                                {toPercentageDisplay(detail.score)}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`mt-1 ${
                              passed ? 'text-gray-700' : 'text-red-600'
                            }`}
                          >
                            {detail.reason}
                          </div>
                          {!passed && (
                            <div className='text-xs text-red-600 font-semibold mt-1'>
                              Below threshold — requires follow-up.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
