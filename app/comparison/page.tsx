'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChatbotStorage } from '@/lib/storage';
import type { Chatbot } from '@/lib/types';

export default function ComparisonPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setChatbots(ChatbotStorage.getAll());
  }, []);

  const handleCompare = () => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      setShowComparison(true);
    }
  };

  const comparisonData = {
    metrics: [
      {
        name: 'Overall Score',
        a: '4.2 (85%)',
        b: '4.5 (90%)',
        winner: 'B',
        change: '+5%',
      },
      { name: 'Accuracy', a: '85%', b: '90%', winner: 'B', change: '+5%' },
      {
        name: 'Task Completion',
        a: '92%',
        b: '95%',
        winner: 'B',
        change: '+3%',
      },
      {
        name: 'Response Time',
        a: '450ms',
        b: '380ms',
        winner: 'B',
        change: '-70ms',
      },
      {
        name: 'Error Rate',
        a: '2.5%',
        b: '1.2%',
        winner: 'B',
        change: '-1.3%',
      },
      {
        name: 'User Satisfaction',
        a: '4.1/5',
        b: '4.6/5',
        winner: 'B',
        change: '+0.5',
      },
    ],
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Chatbot Comparison</h1>
        <p className='mt-2 text-gray-800'>
          Compare performance between chatbot versions
        </p>
      </div>

      <Card title='Select Chatbots to Compare'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Variant A (Control)
            </label>
            <select
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
            >
              <option value=''>Select chatbot...</option>
              {chatbots.map((cb) => (
                <option key={cb.id} value={cb.id}>
                  {cb.name} {cb.version}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Variant B (Treatment)
            </label>
            <select
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
            >
              <option value=''>Select chatbot...</option>
              {chatbots.map((cb) => (
                <option
                  key={cb.id}
                  value={cb.id}
                  disabled={cb.id === selectedA}
                >
                  {cb.name} {cb.version}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='mt-6 flex gap-4'>
          <Button onClick={handleCompare} disabled={!selectedA || !selectedB}>
            Compare
          </Button>
          <Button
            variant='secondary'
            onClick={() =>
              alert(
                '🧪 Run A/B Test\n\nThis will create a live A/B test with real users:\n• Split traffic between variants\n• Track real-time metrics\n• Statistical significance testing\n• Automatic winner detection\n\n(Feature coming in Phase 2)'
              )
            }
          >
            Run A/B Test
          </Button>
        </div>
      </Card>

      {showComparison && (
        <>
          <Card title='Comparison Results'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-semibold text-gray-700'>
                      Metric
                    </th>
                    <th className='text-center py-3 px-4 font-semibold text-gray-700'>
                      Variant A
                    </th>
                    <th className='text-center py-3 px-4 font-semibold text-gray-700'>
                      Variant B
                    </th>
                    <th className='text-center py-3 px-4 font-semibold text-gray-700'>
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.metrics.map((metric, idx) => (
                    <tr
                      key={idx}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='py-3 px-4 font-medium text-gray-900'>
                        {metric.name}
                      </td>
                      <td className='py-3 px-4 text-center text-gray-700'>
                        {metric.a}
                      </td>
                      <td className='py-3 px-4 text-center text-gray-700 font-semibold'>
                        {metric.b}
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            metric.winner === 'B'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {metric.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>🏆</span>
                <div>
                  <p className='font-semibold text-green-900'>
                    Winner: Variant B
                  </p>
                  <p className='text-sm text-green-700'>
                    Better in 6/6 metrics
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title='Recommendations'>
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <span className='text-green-600 font-bold'>✓</span>
                <div>
                  <p className='font-medium text-gray-900'>Deploy Variant B</p>
                  <p className='text-sm text-gray-800'>
                    Shows significant improvement across all metrics
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-blue-600 font-bold'>ℹ</span>
                <div>
                  <p className='font-medium text-gray-900'>
                    Suggested Rollout Strategy
                  </p>
                  <p className='text-sm text-gray-800'>
                    Week 1: 25% → Week 2: 50% → Week 3: 100%
                  </p>
                </div>
              </div>
            </div>
            <div className='mt-4 flex gap-3'>
              <Button
                onClick={() =>
                  alert(
                    '📥 Download Report\n\nThis will export a detailed comparison report (PDF format).\n\n(Feature coming in Phase 2)'
                  )
                }
              >
                Download Report
              </Button>
              <Button
                variant='secondary'
                onClick={() =>
                  alert(
                    '📊 Export Data\n\nThis will export comparison data as CSV for further analysis.\n\n(Feature coming in Phase 2)'
                  )
                }
              >
                Export Data
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
