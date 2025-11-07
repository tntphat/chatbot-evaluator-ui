'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EvaluationHistory, ComparisonResult } from '@/lib/types';

export default function ComparisonPage() {
  const [selectedVersionA, setSelectedVersionA] = useState('v2.2');
  const [selectedVersionB, setSelectedVersionB] = useState('v2.3');
  const [showComparison, setShowComparison] = useState(false);

  // Mock evaluation history data
  const mockHistory: EvaluationHistory[] = [
    {
      id: 'eval_001',
      chatbotId: 'bot_hr',
      chatbotVersion: 'v2.2',
      testSuiteId: 'ts_hr_policy',
      evaluationType: 'automated',
      overallScore: 3.8,
      scoresByCriterion: {
        accuracy: 4.2,
        completeness: 3.6,
        relevance: 4.0,
        clarity: 3.5,
        tone: 3.8,
        citations: 2.9,
      },
      passRate: 68,
      timestamp: '2025-10-29T10:00:00Z',
      evaluatorModel: 'claude-3.5',
    },
    {
      id: 'eval_002',
      chatbotId: 'bot_hr',
      chatbotVersion: 'v2.3',
      testSuiteId: 'ts_hr_policy',
      evaluationType: 'automated',
      overallScore: 4.2,
      scoresByCriterion: {
        accuracy: 4.5,
        completeness: 4.0,
        relevance: 4.3,
        clarity: 3.8,
        tone: 4.0,
        citations: 3.2,
      },
      passRate: 79,
      timestamp: '2025-11-05T14:30:00Z',
      evaluatorModel: 'claude-3.5',
    },
    {
      id: 'eval_003',
      chatbotId: 'bot_hr',
      chatbotVersion: 'v2.1',
      testSuiteId: 'ts_hr_policy',
      evaluationType: 'automated',
      overallScore: 3.5,
      scoresByCriterion: {
        accuracy: 3.8,
        completeness: 3.4,
        relevance: 3.7,
        clarity: 3.3,
        tone: 3.6,
        citations: 2.7,
      },
      passRate: 58,
      timestamp: '2025-10-15T10:00:00Z',
      evaluatorModel: 'gpt-4',
    },
  ];

  const versionA = mockHistory.find(
    (h) => h.chatbotVersion === selectedVersionA
  );
  const versionB = mockHistory.find(
    (h) => h.chatbotVersion === selectedVersionB
  );

  const handleCompare = () => {
    setShowComparison(true);
  };

  const calculateChange = (a: number, b: number) => {
    return Math.round((b - a) * 10) / 10;
  };

  const getChangeColor = (change: number) => {
    if (change > 0.3) return 'text-green-700';
    if (change > 0) return 'text-green-600';
    if (change < -0.3) return 'text-red-700';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '⬆';
    if (change < 0) return '⬇';
    return '→';
  };

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Version Comparison & Analysis
        </h1>
        <p className='mt-2 text-gray-700'>
          Compare chatbot versions to track improvements and identify
          regressions
        </p>
      </div>

      {/* Version Selection */}
      <Card title='Select Versions to Compare'>
        <div className='grid grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-semibold text-gray-800 mb-2'>
              Version A (Baseline)
            </label>
            <select
              className='w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900'
              value={selectedVersionA}
              onChange={(e) => {
                setSelectedVersionA(e.target.value);
                setShowComparison(false);
              }}
            >
              {mockHistory.map((h) => (
                <option key={h.id} value={h.chatbotVersion}>
                  {h.chatbotVersion} -{' '}
                  {new Date(h.timestamp).toLocaleDateString()} ( Score:{' '}
                  {h.overallScore})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-800 mb-2'>
              Version B (Current)
            </label>
            <select
              className='w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900'
              value={selectedVersionB}
              onChange={(e) => {
                setSelectedVersionB(e.target.value);
                setShowComparison(false);
              }}
            >
              {mockHistory.map((h) => (
                <option key={h.id} value={h.chatbotVersion}>
                  {h.chatbotVersion} -{' '}
                  {new Date(h.timestamp).toLocaleDateString()} ( Score:{' '}
                  {h.overallScore})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mt-6 flex justify-center'>
          <Button
            onClick={handleCompare}
            disabled={selectedVersionA === selectedVersionB}
          >
            Compare Versions
          </Button>
        </div>

        {selectedVersionA === selectedVersionB && (
          <p className='text-sm text-red-600 text-center mt-2'>
            Please select two different versions to compare
          </p>
        )}
      </Card>

      {/* Comparison Results */}
      {showComparison && versionA && versionB && (
        <>
          {/* Overall Comparison */}
          <Card title='📊 Overall Performance Comparison'>
            <div className='grid grid-cols-3 gap-6'>
              {/* Version A */}
              <div className='text-center p-6 bg-gray-50 rounded-lg'>
                <div className='text-sm text-gray-600 mb-2'>Version A</div>
                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {versionA.chatbotVersion}
                </div>
                <div className='text-4xl font-bold text-blue-600'>
                  {versionA.overallScore.toFixed(1)}
                </div>
                <div className='text-xs text-gray-600 mt-1'>/5.0</div>
                <div className='mt-3 text-sm'>
                  <div className='text-gray-700'>
                    Pass Rate: {versionA.passRate}%
                  </div>
                  <div className='text-gray-600 text-xs mt-1'>
                    {new Date(versionA.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Change Arrow */}
              <div className='flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-6xl'>→</div>
                  <div
                    className={`text-2xl font-bold mt-2 ${getChangeColor(
                      versionB.overallScore - versionA.overallScore
                    )}`}
                  >
                    {calculateChange(
                      versionA.overallScore,
                      versionB.overallScore
                    ) > 0
                      ? '+'
                      : ''}
                    {calculateChange(
                      versionA.overallScore,
                      versionB.overallScore
                    )}
                  </div>
                  <div className='text-xs text-gray-600'>Change</div>
                </div>
              </div>

              {/* Version B */}
              <div className='text-center p-6 bg-green-50 rounded-lg border-2 border-green-500'>
                <div className='text-sm text-gray-600 mb-2'>
                  Version B (Latest)
                </div>
                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {versionB.chatbotVersion}
                </div>
                <div className='text-4xl font-bold text-green-600'>
                  {versionB.overallScore.toFixed(1)}
                </div>
                <div className='text-xs text-gray-600 mt-1'>/5.0</div>
                <div className='mt-3 text-sm'>
                  <div className='text-gray-700'>
                    Pass Rate: {versionB.passRate}%
                  </div>
                  <div className='text-gray-600 text-xs mt-1'>
                    {new Date(versionB.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              {versionB.overallScore > versionA.overallScore ? (
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>✅</span>
                  <div>
                    <div className='font-bold text-blue-900'>
                      Version B shows improvement! (+
                      {calculateChange(
                        versionA.overallScore,
                        versionB.overallScore
                      )}
                      )
                    </div>
                    <p className='text-sm text-blue-800'>
                      The new version performs better. Pass rate increased by{' '}
                      {versionB.passRate - versionA.passRate}%.
                    </p>
                  </div>
                </div>
              ) : versionB.overallScore < versionA.overallScore ? (
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>⚠️</span>
                  <div>
                    <div className='font-bold text-red-900'>
                      Version B shows regression (
                      {calculateChange(
                        versionA.overallScore,
                        versionB.overallScore
                      )}
                      )
                    </div>
                    <p className='text-sm text-red-800'>
                      The new version performs worse. Investigate what changed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className='text-center text-gray-700'>
                  No significant change between versions
                </div>
              )}
            </div>
          </Card>

          {/* Criteria Comparison */}
          <Card title='📈 Scores by Criterion - Detailed Comparison'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-300'>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Criterion
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Version A
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Version B
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(versionA.scoresByCriterion).map((criterion) => {
                    const scoreA = versionA.scoresByCriterion[criterion];
                    const scoreB = versionB.scoresByCriterion[criterion];
                    const change = calculateChange(scoreA, scoreB);

                    return (
                      <tr key={criterion} className='border-b border-gray-200'>
                        <td className='py-3 px-4 font-medium text-gray-900 capitalize'>
                          {criterion}
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <span className='text-gray-800'>
                            {scoreA.toFixed(1)}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <span className='font-semibold text-gray-900'>
                            {scoreB.toFixed(1)}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <span
                            className={`font-bold flex items-center justify-center gap-1 ${getChangeColor(
                              change
                            )}`}
                          >
                            <span>{getChangeIcon(change)}</span>
                            <span>
                              {change > 0 && '+'}
                              {change.toFixed(1)}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className='bg-gray-50 font-bold'>
                    <td className='py-3 px-4 text-gray-900'>Overall Score</td>
                    <td className='py-3 px-4 text-center text-gray-800'>
                      {versionA.overallScore.toFixed(1)}
                    </td>
                    <td className='py-3 px-4 text-center text-gray-900'>
                      {versionB.overallScore.toFixed(1)}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span
                        className={`font-bold flex items-center justify-center gap-1 ${getChangeColor(
                          versionB.overallScore - versionA.overallScore
                        )}`}
                      >
                        <span>
                          {getChangeIcon(
                            versionB.overallScore - versionA.overallScore
                          )}
                        </span>
                        <span>
                          {versionB.overallScore - versionA.overallScore > 0 &&
                            '+'}
                          {calculateChange(
                            versionA.overallScore,
                            versionB.overallScore
                          )}
                        </span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Visual Comparison - Radar Chart Representation */}
          <Card title='Visual Comparison'>
            <div className='space-y-4'>
              {Object.keys(versionA.scoresByCriterion).map((criterion) => {
                const scoreA = versionA.scoresByCriterion[criterion];
                const scoreB = versionB.scoresByCriterion[criterion];
                const percentA = (scoreA / 5.0) * 100;
                const percentB = (scoreB / 5.0) * 100;

                return (
                  <div key={criterion} className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-semibold text-gray-800 capitalize'>
                        {criterion}
                      </span>
                      <span className='text-sm text-gray-600'>
                        {scoreA.toFixed(1)} → {scoreB.toFixed(1)}
                      </span>
                    </div>
                    <div className='relative h-8'>
                      {/* Version A bar (background) */}
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full bg-gray-200 rounded-full h-4'>
                          <div
                            className='bg-gray-400 h-4 rounded-full opacity-50'
                            style={{ width: `${percentA}%` }}
                          />
                        </div>
                      </div>
                      {/* Version B bar (foreground) */}
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full h-4'>
                          <div
                            className={`h-4 rounded-full ${
                              scoreB >= scoreA ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${percentB}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className='flex gap-6 justify-center mt-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 bg-gray-400 opacity-50 rounded'></div>
                  <span className='text-gray-700'>
                    Version A ({selectedVersionA})
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 bg-green-600 rounded'></div>
                  <span className='text-gray-700'>
                    Version B ({selectedVersionB})
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Improvements & Regressions */}
          <div className='grid grid-cols-2 gap-6'>
            {/* Improvements */}
            <Card title='✅ Improvements'>
              <div className='space-y-2'>
                {Object.entries(versionB.scoresByCriterion)
                  .filter(
                    ([key, scoreB]) => scoreB > versionA.scoresByCriterion[key]
                  )
                  .sort(
                    ([, a], [, b]) =>
                      b -
                      versionA.scoresByCriterion[
                        Object.keys(versionB.scoresByCriterion).find(
                          (k) => versionB.scoresByCriterion[k] === b
                        ) || ''
                      ] -
                      (a -
                        versionA.scoresByCriterion[
                          Object.keys(versionB.scoresByCriterion).find(
                            (k) => versionB.scoresByCriterion[k] === a
                          ) || ''
                        ])
                  )
                  .map(([criterion, scoreB]) => {
                    const scoreA = versionA.scoresByCriterion[criterion];
                    const change = calculateChange(scoreA, scoreB);
                    return (
                      <div
                        key={criterion}
                        className='p-3 bg-green-50 border border-green-200 rounded'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='font-medium text-green-900 capitalize'>
                            {criterion}
                          </span>
                          <Badge variant='success'>+{change.toFixed(1)}</Badge>
                        </div>
                        <div className='text-xs text-green-800 mt-1'>
                          {scoreA.toFixed(1)} → {scoreB.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}

                {Object.values(versionB.scoresByCriterion).every(
                  (scoreB, idx) =>
                    scoreB <= Object.values(versionA.scoresByCriterion)[idx]
                ) && (
                  <p className='text-center text-gray-600 py-4'>
                    No improvements detected
                  </p>
                )}
              </div>
            </Card>

            {/* Regressions */}
            <Card title='⚠️ Regressions'>
              <div className='space-y-2'>
                {Object.entries(versionB.scoresByCriterion)
                  .filter(
                    ([key, scoreB]) => scoreB < versionA.scoresByCriterion[key]
                  )
                  .map(([criterion, scoreB]) => {
                    const scoreA = versionA.scoresByCriterion[criterion];
                    const change = calculateChange(scoreA, scoreB);
                    return (
                      <div
                        key={criterion}
                        className='p-3 bg-red-50 border border-red-200 rounded'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='font-medium text-red-900 capitalize'>
                            {criterion}
                          </span>
                          <Badge variant='error'>{change.toFixed(1)}</Badge>
                        </div>
                        <div className='text-xs text-red-800 mt-1'>
                          {scoreA.toFixed(1)} → {scoreB.toFixed(1)}
                        </div>
                        <div className='text-xs text-red-700 mt-2'>
                          ⚠ Investigate what caused this regression
                        </div>
                      </div>
                    );
                  })}

                {Object.values(versionB.scoresByCriterion).every(
                  (scoreB, idx) =>
                    scoreB >= Object.values(versionA.scoresByCriterion)[idx]
                ) && (
                  <p className='text-center text-green-700 py-4'>
                    ✓ No regressions! All criteria improved or stable.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card title='💡 Recommendations'>
            <div className='space-y-4'>
              {versionB.overallScore > versionA.overallScore ? (
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='font-semibold text-green-900 mb-2'>
                    ✅ Version B is Better
                  </div>
                  <ul className='text-sm text-green-800 space-y-1'>
                    <li>
                      • Overall score improved by{' '}
                      {calculateChange(
                        versionA.overallScore,
                        versionB.overallScore
                      )}
                    </li>
                    <li>
                      • Pass rate increased by{' '}
                      {versionB.passRate - versionA.passRate}%
                    </li>
                    <li>
                      •{' '}
                      {
                        Object.entries(versionB.scoresByCriterion).filter(
                          ([key, scoreB]) =>
                            scoreB > versionA.scoresByCriterion[key]
                        ).length
                      }{' '}
                      out of {Object.keys(versionB.scoresByCriterion).length}{' '}
                      criteria improved
                    </li>
                    {versionB.overallScore >= 4.5 && (
                      <li className='font-semibold'>
                        → Recommendation: ✓ Ready to deploy to production
                      </li>
                    )}
                    {versionB.overallScore >= 4.0 &&
                      versionB.overallScore < 4.5 && (
                        <li className='font-semibold'>
                          → Recommendation: Deploy with monitoring, or continue
                          minor improvements
                        </li>
                      )}
                  </ul>
                </div>
              ) : (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='font-semibold text-red-900 mb-2'>
                    ⚠️ Version B is Worse
                  </div>
                  <ul className='text-sm text-red-800 space-y-1'>
                    <li>
                      • Overall score decreased by{' '}
                      {Math.abs(
                        calculateChange(
                          versionA.overallScore,
                          versionB.overallScore
                        )
                      )}
                    </li>
                    <li>
                      → Action: Review what changed between v{selectedVersionA}{' '}
                      and v{selectedVersionB}
                    </li>
                    <li>
                      → Action: Consider rolling back to v{selectedVersionA}
                    </li>
                    <li>
                      → Action: Investigate regressions in:{' '}
                      {Object.entries(versionB.scoresByCriterion)
                        .filter(
                          ([key, scoreB]) =>
                            scoreB < versionA.scoresByCriterion[key]
                        )
                        .map(([key]) => key)
                        .join(', ')}
                    </li>
                  </ul>
                </div>
              )}

              {/* Specific Recommendations */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='font-semibold text-blue-900 mb-2'>
                  Specific Actions:
                </div>
                <ul className='text-sm text-blue-800 space-y-2'>
                  {Object.entries(versionB.scoresByCriterion)
                    .filter(([key]) => versionB.scoresByCriterion[key] < 3.5)
                    .map(([criterion, score]) => (
                      <li key={criterion}>
                        <span className='capitalize font-medium'>
                          {criterion}
                        </span>{' '}
                        ({score.toFixed(1)}/5.0) is below target:
                        <div className='ml-4 text-xs text-blue-700 mt-1'>
                          {criterion === 'accuracy' &&
                            '→ Review training data for factual correctness'}
                          {criterion === 'completeness' &&
                            '→ Add more comprehensive examples'}
                          {criterion === 'relevance' &&
                            '→ Refine system prompt to stay on-topic'}
                          {criterion === 'clarity' &&
                            '→ Simplify language in training data'}
                          {criterion === 'tone' &&
                            '→ Add tone guidelines to system prompt'}
                          {criterion === 'citations' &&
                            '→ Update prompt to request source citations'}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Time-series Preview */}
          <Card title='📊 Performance Trend (Last 3 Evaluations)'>
            <div className='space-y-4'>
              <div className='relative h-64 border border-gray-300 rounded-lg p-6 bg-white'>
                {/* Simple line chart representation */}
                <div className='absolute inset-6'>
                  {/* Y-axis labels */}
                  <div className='absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 -ml-6'>
                    <span>5.0</span>
                    <span>4.0</span>
                    <span>3.0</span>
                    <span>2.0</span>
                    <span>1.0</span>
                  </div>

                  {/* Grid lines */}
                  <div className='absolute inset-0 flex flex-col justify-between'>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className='border-t border-gray-200'></div>
                    ))}
                  </div>

                  {/* Data points */}
                  <div className='absolute inset-0 flex items-end justify-around'>
                    {mockHistory
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime()
                      )
                      .map((evaluation, idx) => {
                        const height = (evaluation.overallScore / 5.0) * 100;
                        return (
                          <div
                            key={evaluation.id}
                            className='flex flex-col items-center flex-1'
                          >
                            <div
                              className='w-full mx-2 bg-blue-600 rounded-t transition-all hover:bg-blue-700'
                              style={{ height: `${height}%` }}
                            >
                              <div className='text-center text-xs font-semibold text-white pt-2'>
                                {evaluation.overallScore.toFixed(1)}
                              </div>
                            </div>
                            <div className='text-xs text-gray-700 mt-2 text-center'>
                              <div className='font-semibold'>
                                {evaluation.chatbotVersion}
                              </div>
                              <div className='text-gray-600'>
                                {new Date(
                                  evaluation.timestamp
                                ).toLocaleDateString('vi-VN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className='text-center'>
                <div className='inline-flex items-center gap-2 text-sm'>
                  <span className='text-gray-600'>Trend:</span>
                  <Badge variant='success'>⬆ IMPROVING</Badge>
                  <span className='text-gray-600'>
                    (Steady growth from 3.5 → 4.2)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className='flex justify-center gap-4'>
            <Button
              variant='secondary'
              onClick={() => {
                setShowComparison(false);
                setStep('config');
              }}
            >
              Compare Different Versions
            </Button>
            <Button variant='secondary'>View Detailed Report</Button>
            <Button>Re-run Evaluation</Button>
          </div>
        </>
      )}
    </div>
  );
}
