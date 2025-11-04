'use client';

import { useEffect, useState } from 'react';
import { MetricCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CampaignStorage,
  ChatbotStorage,
  DatasetStorage,
  initializeMockData,
} from '@/lib/storage';
import Link from 'next/link';
import type { Campaign } from '@/lib/types';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalChatbots: 0,
    totalDatasets: 0,
    avgQuality: 0,
    avgPassRate: 0,
  });

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();

    // Load data
    const campaignsData = CampaignStorage.getAll();
    const chatbotsData = ChatbotStorage.getAll();
    const datasetsData = DatasetStorage.getAll();

    setCampaigns(campaignsData);

    // Calculate stats
    const activeCampaigns = campaignsData.filter(
      (c: Campaign) => c.status === 'running'
    ).length;
    const completedCampaigns = campaignsData.filter(
      (c: Campaign) => c.status === 'completed'
    );

    const avgQuality =
      completedCampaigns.length > 0
        ? completedCampaigns.reduce(
            (sum: number, c: Campaign) =>
              sum + (c.results?.avgQualityScore || 0),
            0
          ) / completedCampaigns.length
        : 0;

    const avgPassRate =
      completedCampaigns.length > 0
        ? completedCampaigns.reduce(
            (sum: number, c: Campaign) => sum + (c.results?.passRate || 0),
            0
          ) / completedCampaigns.length
        : 0;

    setStats({
      totalCampaigns: campaignsData.length,
      activeCampaigns,
      totalChatbots: chatbotsData.length,
      totalDatasets: datasetsData.length,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgPassRate: Math.round(avgPassRate),
    });
  }, []);

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

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='mt-2 text-gray-800'>
            Overview of your chatbot evaluation metrics
          </p>
        </div>
        <Link href='/campaigns/new'>
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title='Total Campaigns'
          value={stats.totalCampaigns}
          icon='🎯'
        />
        <MetricCard
          title='Active Campaigns'
          value={stats.activeCampaigns}
          change={stats.activeCampaigns > 0 ? 'Running' : 'None'}
          changeType={stats.activeCampaigns > 0 ? 'positive' : 'neutral'}
          icon='▶️'
        />
        <MetricCard
          title='Average Quality'
          value={`${stats.avgQuality}/5`}
          change={
            stats.avgQuality >= 4
              ? 'Excellent'
              : stats.avgQuality >= 3
              ? 'Good'
              : 'Needs Improvement'
          }
          changeType={
            stats.avgQuality >= 4
              ? 'positive'
              : stats.avgQuality >= 3
              ? 'neutral'
              : 'negative'
          }
          icon='⭐'
        />
        <MetricCard
          title='Pass Rate'
          value={`${stats.avgPassRate}%`}
          change={stats.avgPassRate >= 85 ? '+Target' : 'Below Target'}
          changeType={stats.avgPassRate >= 85 ? 'positive' : 'negative'}
          icon='✅'
        />
      </div>

      {/* Secondary Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <MetricCard
          title='Total Chatbots'
          value={stats.totalChatbots}
          icon='🤖'
        />
        <MetricCard
          title='Test Datasets'
          value={stats.totalDatasets}
          icon='📚'
        />
      </div>

      {/* Recent Campaigns */}
      <Card title='Recent Campaigns' subtitle='Latest evaluation campaigns'>
        <div className='space-y-4'>
          {campaigns.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-700 text-lg'>No campaigns yet</p>
              <p className='text-gray-600 mt-2'>
                Create your first evaluation campaign to get started
              </p>
              <Link href='/campaigns/new'>
                <Button className='mt-4'>Create Campaign</Button>
              </Link>
            </div>
          ) : (
            campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <h4 className='font-semibold text-gray-900'>
                      {campaign.name}
                    </h4>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className='text-sm text-gray-800 mt-1'>
                    {campaign.description}
                  </p>
                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-700'>
                    <span>📊 {campaign.chatbotIds.length} chatbot(s)</span>
                    <span>
                      📅 {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    {campaign.progress !== undefined && (
                      <span>⏳ {campaign.progress}% complete</span>
                    )}
                  </div>
                </div>
                <Link href={`/campaigns/${campaign.id}`}>
                  <Button variant='ghost' size='sm'>
                    View →
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
        {campaigns.length > 5 && (
          <div className='mt-4 text-center'>
            <Link href='/campaigns'>
              <Button variant='ghost'>View All Campaigns →</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title='Quick Actions'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link
            href='/campaigns/new'
            className='p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center'
          >
            <div className='text-3xl mb-2'>🎯</div>
            <div className='font-semibold text-gray-900'>New Campaign</div>
            <div className='text-sm text-gray-600 mt-1'>Start evaluation</div>
          </Link>
          <Link
            href='/datasets'
            className='p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center'
          >
            <div className='text-3xl mb-2'>📚</div>
            <div className='font-semibold text-gray-900'>Manage Datasets</div>
            <div className='text-sm text-gray-600 mt-1'>Create test data</div>
          </Link>
          <Link
            href='/comparison'
            className='p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center'
          >
            <div className='text-3xl mb-2'>⚖️</div>
            <div className='font-semibold text-gray-900'>Compare Chatbots</div>
            <div className='text-sm text-gray-600 mt-1'>A/B testing</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
