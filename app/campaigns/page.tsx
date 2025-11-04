'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CampaignStorage, ChatbotStorage } from '@/lib/storage';
import type { Campaign, Chatbot } from '@/lib/types';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [filter, setFilter] = useState<'all' | Campaign['status']>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCampaigns(CampaignStorage.getAll());
    setChatbots(ChatbotStorage.getAll());
  };

  const filteredCampaigns =
    filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const getChatbotNames = (chatbotIds: string[]) => {
    return chatbotIds
      .map((id) => chatbots.find((cb) => cb.id === id)?.name || 'Unknown')
      .join(', ');
  };

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

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      CampaignStorage.delete(id);
      loadData();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Evaluation Campaigns
          </h1>
          <p className='mt-2 text-gray-800'>
            Manage and monitor your evaluation campaigns
          </p>
        </div>
        <Link href='/campaigns/new'>
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className='flex gap-2'>
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('all')}
        >
          All ({campaigns.length})
        </Button>
        <Button
          variant={filter === 'running' ? 'primary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('running')}
        >
          Running ({campaigns.filter((c) => c.status === 'running').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('completed')}
        >
          Completed ({campaigns.filter((c) => c.status === 'completed').length})
        </Button>
        <Button
          variant={filter === 'draft' ? 'primary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('draft')}
        >
          Draft ({campaigns.filter((c) => c.status === 'draft').length})
        </Button>
      </div>

      {/* Campaigns List */}
      <div className='space-y-4'>
        {filteredCampaigns.length === 0 ? (
          <Card>
            <div className='text-center py-12'>
              <p className='text-gray-700 text-lg'>No campaigns found</p>
              <p className='text-gray-800 mt-2'>
                Create your first evaluation campaign
              </p>
              <Link href='/campaigns/new'>
                <Button className='mt-4'>Create Campaign</Button>
              </Link>
            </div>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className='hover:shadow-lg transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {campaign.name}
                    </h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className='text-gray-800 mb-4'>{campaign.description}</p>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                    <div>
                      <p className='text-sm text-gray-700'>Chatbot(s)</p>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {getChatbotNames(campaign.chatbotIds)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-700'>Type</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {campaign.evaluationType.join(' + ')}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-700'>Created</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-700'>Progress</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {campaign.progress || 0}%
                      </p>
                    </div>
                  </div>

                  {campaign.status === 'running' && (
                    <div className='mb-4'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all'
                          style={{ width: `${campaign.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {campaign.results && (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
                      <div>
                        <p className='text-xs text-gray-700'>Pass Rate</p>
                        <p className='text-lg font-bold text-gray-900'>
                          {campaign.results.passRate}%
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-700'>Quality Score</p>
                        <p className='text-lg font-bold text-gray-900'>
                          {campaign.results.avgQualityScore}/5
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-700'>Task Completion</p>
                        <p className='text-lg font-bold text-gray-900'>
                          {campaign.results.taskCompletionRate}%
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-700'>Response Time</p>
                        <p className='text-lg font-bold text-gray-900'>
                          {campaign.results.avgResponseTime}ms
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex flex-col gap-2 ml-4'>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size='sm'>View Details</Button>
                  </Link>
                  {campaign.status === 'draft' && (
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() =>
                        alert(
                          '▶️ Start Campaign\n\nThis will begin the evaluation process.\n\n(Feature coming soon)'
                        )
                      }
                    >
                      Start
                    </Button>
                  )}
                  {campaign.status === 'running' && (
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() =>
                        alert(
                          '⏸️ Pause Campaign\n\nThis will pause the evaluation. You can resume later.\n\n(Feature coming soon)'
                        )
                      }
                    >
                      Pause
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='danger'
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
