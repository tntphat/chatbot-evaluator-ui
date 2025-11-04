'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CampaignStorage, ChatbotStorage } from '@/lib/storage';
import type { Campaign, Chatbot } from '@/lib/types';
import Link from 'next/link';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  useEffect(() => {
    const id = params.id as string;
    const campaignData = CampaignStorage.getById(id) as Campaign | null;

    if (!campaignData) {
      alert('Campaign not found!');
      router.push('/campaigns');
      return;
    }

    setCampaign(campaignData);
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
  }, [params.id, router]);

  if (!campaign) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-gray-700 text-lg'>Loading campaign...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const variants: Record<
      Campaign['status'],
      'success' | 'warning' | 'error' | 'info' | 'neutral'
    > = {
      draft: 'neutral',
      running: 'info',
      paused: 'warning',
      completed: 'success',
      failed: 'error',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getChatbotNames = () => {
    return campaign.chatbotIds
      .map((id) => chatbots.find((cb) => cb.id === id)?.name || 'Unknown')
      .join(', ');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/campaigns'>
            <Button variant='ghost' size='sm'>
              ← Back
            </Button>
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold text-gray-900'>
                {campaign.name}
              </h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className='mt-2 text-gray-800'>{campaign.description}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          {campaign.status === 'draft' && (
            <Button
              variant='secondary'
              onClick={() =>
                alert(
                  '🚧 Feature Coming Soon!\n\nThis will start the evaluation campaign and begin processing test cases.'
                )
              }
            >
              Start Campaign
            </Button>
          )}
          {campaign.status === 'running' && (
            <Button
              variant='secondary'
              onClick={() =>
                alert(
                  '⏸️ Pause Campaign\n\nThis will pause the running evaluation. You can resume it later.'
                )
              }
            >
              Pause
            </Button>
          )}
          {campaign.status === 'completed' && (
            <Button
              onClick={() =>
                alert(
                  '📥 Download Report\n\nThis will export a detailed PDF report with all evaluation results and recommendations.\n\n(Feature coming in Phase 2)'
                )
              }
            >
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Info */}
      <Card title='Campaign Information'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          <div>
            <p className='text-sm text-gray-700'>Chatbot(s)</p>
            <p className='mt-1 font-medium text-gray-900'>
              {getChatbotNames()}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-700'>Evaluation Type</p>
            <p className='mt-1 font-medium text-gray-900'>
              {campaign.evaluationType.join(' + ')}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-700'>Created</p>
            <p className='mt-1 font-medium text-gray-900'>
              {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-700'>Status</p>
            <p className='mt-1 font-medium text-gray-900'>
              {campaign.status.toUpperCase()}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      {(campaign.status === 'running' || campaign.status === 'completed') && (
        <Card title='Progress'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-800'>Evaluation Progress</span>
              <span className='text-sm font-semibold text-gray-900'>
                {campaign.progress || 0}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all'
                style={{ width: `${campaign.progress || 0}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {campaign.results && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <MetricCard
              title='Pass Rate'
              value={`${campaign.results.passRate}%`}
              icon='✅'
              change={
                campaign.results.passRate >= 85
                  ? 'Above Target'
                  : 'Below Target'
              }
              changeType={
                campaign.results.passRate >= 85 ? 'positive' : 'negative'
              }
            />
            <MetricCard
              title='Quality Score'
              value={`${campaign.results.avgQualityScore}/5`}
              icon='⭐'
              change={
                campaign.results.avgQualityScore >= 4 ? 'Excellent' : 'Good'
              }
              changeType={
                campaign.results.avgQualityScore >= 4 ? 'positive' : 'neutral'
              }
            />
            <MetricCard
              title='Task Completion'
              value={`${campaign.results.taskCompletionRate}%`}
              icon='🎯'
            />
            <MetricCard
              title='Avg Response Time'
              value={`${campaign.results.avgResponseTime}ms`}
              icon='⚡'
              change={
                campaign.results.avgResponseTime < 500
                  ? 'Fast'
                  : 'Needs Optimization'
              }
              changeType={
                campaign.results.avgResponseTime < 500 ? 'positive' : 'warning'
              }
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card title='Test Summary'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Total Tests</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.totalTests}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Passed</span>
                  <span className='font-bold text-green-600'>
                    {campaign.results.passedTests}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Failed</span>
                  <span className='font-bold text-red-600'>
                    {campaign.results.failedTests}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                  <span className='text-gray-800'>Error Rate</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.errorRate}%
                  </span>
                </div>
              </div>
            </Card>

            <Card title='Quality Metrics'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Accuracy</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.avgAccuracy}%
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Quality Score</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.avgQualityScore}/5
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-800'>Task Completion</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.taskCompletionRate}%
                  </span>
                </div>
                <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                  <span className='text-gray-800'>Response Time</span>
                  <span className='font-bold text-gray-900'>
                    {campaign.results.avgResponseTime}ms
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card title='Recommendations'>
            <div className='space-y-3'>
              {campaign.results.passRate < 85 && (
                <div className='flex gap-3 p-3 bg-yellow-50 rounded-lg'>
                  <span className='text-yellow-600 font-bold'>⚠️</span>
                  <div>
                    <p className='font-medium text-gray-900'>
                      Pass rate below target
                    </p>
                    <p className='text-sm text-gray-800'>
                      Consider reviewing failed test cases and improving chatbot
                      responses
                    </p>
                  </div>
                </div>
              )}
              {campaign.results.avgQualityScore >= 4 && (
                <div className='flex gap-3 p-3 bg-green-50 rounded-lg'>
                  <span className='text-green-600 font-bold'>✓</span>
                  <div>
                    <p className='font-medium text-gray-900'>
                      High quality score
                    </p>
                    <p className='text-sm text-gray-800'>
                      Chatbot performance meets quality standards
                    </p>
                  </div>
                </div>
              )}
              {campaign.results.avgResponseTime > 500 && (
                <div className='flex gap-3 p-3 bg-blue-50 rounded-lg'>
                  <span className='text-blue-600 font-bold'>ℹ</span>
                  <div>
                    <p className='font-medium text-gray-900'>
                      Optimize response time
                    </p>
                    <p className='text-sm text-gray-800'>
                      Consider caching or model optimization to improve speed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Actions */}
      <Card title='Actions'>
        <div className='flex gap-3'>
          <Button
            onClick={() =>
              alert(
                '📄 Export Report (PDF)\n\nThis will generate a comprehensive PDF report with:\n• Campaign summary\n• Detailed metrics\n• Charts and graphs\n• Recommendations\n\n(Feature coming in Phase 2)'
              )
            }
          >
            Export Report (PDF)
          </Button>
          <Button
            variant='secondary'
            onClick={() =>
              alert(
                '📊 Export Data (CSV)\n\nThis will export raw evaluation data as CSV file for analysis in Excel or other tools.\n\n(Feature coming in Phase 2)'
              )
            }
          >
            Export Data (CSV)
          </Button>
          <Button
            variant='secondary'
            onClick={() =>
              alert(
                '⚖️ Compare with Other Campaigns\n\nThis will let you compare this campaign with other campaigns to track improvements over time.\n\n(Feature coming in Phase 2)'
              )
            }
          >
            Compare with Other Campaigns
          </Button>
        </div>
      </Card>
    </div>
  );
}
