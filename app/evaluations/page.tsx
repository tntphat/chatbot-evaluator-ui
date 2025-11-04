'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function EvaluationsPage() {
  const mockEvaluations = [
    {
      id: '1',
      conversation: 'Customer refund request',
      chatbot: 'Support Bot v2.1',
      status: 'pending',
      priority: 'high',
    },
    {
      id: '2',
      conversation: 'Product inquiry',
      chatbot: 'Sales Bot v1.5',
      status: 'in_review',
      priority: 'medium',
    },
    {
      id: '3',
      conversation: 'General question',
      chatbot: 'FAQ Bot v3.0',
      status: 'completed',
      priority: 'low',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'error' | 'warning' | 'neutral'> = {
      high: 'error',
      medium: 'warning',
      low: 'neutral',
    };
    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'info' | 'warning' | 'success'> = {
      pending: 'info',
      in_review: 'warning',
      completed: 'success',
    };
    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Human Evaluation Portal
        </h1>
        <p className='mt-2 text-gray-800'>
          Review and rate chatbot conversations
        </p>
      </div>

      <Card
        title='Evaluation Queue'
        subtitle='Conversations awaiting review'
        action={
          <Button
            size='sm'
            variant='secondary'
            onClick={() =>
              alert(
                '🔍 Filter Evaluations\n\nThis will let you filter by:\n• Status (pending, in review, completed)\n• Priority (high, medium, low)\n• Chatbot\n• Date range\n\n(Feature coming in Phase 2)'
              )
            }
          >
            Filter
          </Button>
        }
      >
        <div className='space-y-3'>
          {mockEvaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    {getPriorityBadge(evaluation.priority)}
                    <span className='text-sm text-gray-800'>
                      {evaluation.chatbot}
                    </span>
                  </div>
                  <h4 className='font-semibold text-gray-900'>
                    {evaluation.conversation}
                  </h4>
                  <div className='mt-2'>
                    {getStatusBadge(evaluation.status)}
                  </div>
                </div>
                <Link href={`/evaluations/${evaluation.id}`}>
                  <Button size='sm'>Review Now →</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card title='Pending'>
          <div className='text-center'>
            <div className='text-4xl font-bold text-blue-600'>12</div>
            <div className='text-sm text-gray-800 mt-2'>Awaiting review</div>
          </div>
        </Card>
        <Card title='In Review'>
          <div className='text-center'>
            <div className='text-4xl font-bold text-yellow-600'>3</div>
            <div className='text-sm text-gray-800 mt-2'>
              Currently reviewing
            </div>
          </div>
        </Card>
        <Card title='Completed'>
          <div className='text-center'>
            <div className='text-4xl font-bold text-green-600'>156</div>
            <div className='text-sm text-gray-800 mt-2'>Reviews completed</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
