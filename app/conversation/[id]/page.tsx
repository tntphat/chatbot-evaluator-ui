'use client';

import { useState, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CriterionRating } from '@/components/CriterionRating';
import { IssueFlagging } from '@/components/IssueFlagging';
import {
  DEFAULT_EVALUATION_CRITERIA,
  calculateOverallScore,
} from '@/lib/defaultCriteria';
import { IssueFlag } from '@/lib/types';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  rating?: 'good' | 'bad' | null;
  feedback?: string;
  detailedRating?: {
    accuracy: number;
    completeness: number;
    relevance: number;
    clarity: number;
    tone: number;
    citations: number;
    overallScore: number;
  };
  issueFlags?: IssueFlag[];
}

export default function ConversationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;

  // Mock conversation data
  const [conversation] = useState({
    id: conversationId,
    title: 'Customer Support Conversation #' + conversationId,
    chatbot: 'HR Assistant Bot v2.1',
    user: 'user_12345',
    startedAt: '2025-11-06T10:30:00',
    status: 'completed',
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'user',
      content: 'Tôi muốn biết thông tin về chế độ nghỉ phép năm?',
      timestamp: '2025-11-06T10:30:00',
    },
    {
      id: 'm2',
      role: 'assistant',
      content:
        'Theo Employee Handbook Section 4.2, bạn được hưởng 12 ngày phép năm. Phép năm được tính từ ngày bạn join công ty và có thể sử dụng sau 2 tháng thử việc.',
      timestamp: '2025-11-06T10:30:15',
      rating: null,
    },
    {
      id: 'm3',
      role: 'user',
      content: 'Phép năm có được cộng dồn sang năm sau không?',
      timestamp: '2025-11-06T10:31:00',
    },
    {
      id: 'm4',
      role: 'assistant',
      content:
        'Có, phép năm chưa sử dụng hết có thể cộng dồn sang năm sau, nhưng tối đa 5 ngày. Các ngày phép còn lại sau 5 ngày sẽ không được chuyển sang năm mới.',
      timestamp: '2025-11-06T10:31:20',
      rating: null,
    },
    {
      id: 'm5',
      role: 'user',
      content: 'Cảm ơn! Vậy tôi phải làm gì để xin nghỉ phép?',
      timestamp: '2025-11-06T10:32:00',
    },
    {
      id: 'm6',
      role: 'assistant',
      content:
        'Để xin nghỉ phép, bạn cần:\n1. Gửi đơn xin phép qua hệ thống HR Portal\n2. Được manager phê duyệt\n3. Thông báo cho team trước ít nhất 2 ngày (hoặc 1 tuần với nghỉ > 3 ngày)',
      timestamp: '2025-11-06T10:32:25',
      rating: null,
    },
  ]);

  const [feedbackText, setFeedbackText] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null
  );
  const [detailedRatings, setDetailedRatings] = useState<
    Record<string, Record<string, number>>
  >({});
  const [messageIssues, setMessageIssues] = useState<
    Record<string, IssueFlag[]>
  >({});

  const handleRateMessage = (messageId: string, rating: 'good' | 'bad') => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, rating: msg.rating === rating ? null : rating }
          : msg
      )
    );
  };

  const handleSaveFeedback = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: feedbackText } : msg
      )
    );
    setFeedbackText('');
    alert('Feedback saved!');
  };

  const handleSaveDetailedRating = (messageId: string) => {
    const ratings = detailedRatings[messageId] || {};
    const issues = messageIssues[messageId] || [];
    const overallScore = calculateOverallScore(
      ratings,
      DEFAULT_EVALUATION_CRITERIA
    );

    setMessages(
      messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              detailedRating: {
                ...ratings,
                overallScore,
              } as any,
              issueFlags: issues,
            }
          : msg
      )
    );

    setExpandedMessageId(null);
    alert('Detailed evaluation saved!');
  };

  const hasDetailedRating = (messageId: string) => {
    return messages.find((m) => m.id === messageId)?.detailedRating;
  };

  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const ratedCount = assistantMessages.filter((m) => m.rating).length;
  const goodCount = assistantMessages.filter((m) => m.rating === 'good').length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Conversation Review
          </h1>
          <p className='mt-2 text-gray-700'>{conversation.title}</p>
        </div>
        <Link href='/evaluations'>
          <Button variant='ghost'>← Back to Queue</Button>
        </Link>
      </div>

      {/* Conversation Info */}
      <Card title='📋 Conversation Info'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div>
            <div className='text-sm text-gray-600'>Chatbot</div>
            <div className='font-semibold text-gray-900'>
              {conversation.chatbot}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-600'>User ID</div>
            <div className='font-semibold text-gray-900'>
              {conversation.user}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-600'>Started At</div>
            <div className='font-semibold text-gray-900'>
              {new Date(conversation.startedAt).toLocaleString('vi-VN')}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-600'>Status</div>
            <Badge
              variant={
                conversation.status === 'completed' ? 'success' : 'warning'
              }
            >
              {conversation.status}
            </Badge>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {messages.length}
            </div>
            <div className='text-sm text-gray-600'>Total Messages</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {ratedCount}/{assistantMessages.length}
            </div>
            <div className='text-sm text-gray-600'>Rated</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {goodCount}/{assistantMessages.length}
            </div>
            <div className='text-sm text-gray-600'>Good Responses</div>
          </div>
        </div>
      </Card>

      {/* Conversation Thread */}
      <Card title='💬 Conversation Thread'>
        <div className='space-y-4'>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`inline-block px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900 border border-gray-300'
                  }`}
                >
                  <div className='text-xs mb-1 opacity-70'>
                    {message.role === 'user' ? '👤 User' : '🤖 Assistant'} •{' '}
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                  <div className='whitespace-pre-wrap'>{message.content}</div>
                </div>

                {/* Rating & Feedback (Only for assistant messages) */}
                {message.role === 'assistant' && (
                  <div className='mt-3 p-4 bg-white border border-gray-200 rounded-lg'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-semibold text-gray-800'>
                        Quick Rating:
                      </span>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleRateMessage(message.id, 'good')}
                          className={`px-4 py-2 rounded-md transition-all ${
                            message.rating === 'good'
                              ? 'bg-green-500 text-white shadow-md scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                          }`}
                        >
                          👍 Good
                        </button>
                        <button
                          onClick={() => handleRateMessage(message.id, 'bad')}
                          className={`px-4 py-2 rounded-md transition-all ${
                            message.rating === 'bad'
                              ? 'bg-red-500 text-white shadow-md scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                          }`}
                        >
                          👎 Bad
                        </button>
                      </div>
                    </div>

                    {/* Detailed Evaluation Button */}
                    <div className='mt-3 flex justify-between items-center'>
                      <Button
                        variant={
                          expandedMessageId === message.id
                            ? 'secondary'
                            : 'ghost'
                        }
                        size='sm'
                        onClick={() =>
                          setExpandedMessageId(
                            expandedMessageId === message.id ? null : message.id
                          )
                        }
                      >
                        {expandedMessageId === message.id
                          ? '▼ Hide Detailed Review'
                          : '▶ Detailed Review'}
                      </Button>
                      {hasDetailedRating(message.id) && (
                        <Badge variant='success'>
                          ✓ Detailed:{' '}
                          {message.detailedRating?.overallScore.toFixed(1)}/5.0
                        </Badge>
                      )}
                    </div>

                    {/* Detailed Evaluation Panel */}
                    {expandedMessageId === message.id && (
                      <div className='mt-4 p-4 bg-gray-50 rounded-lg space-y-4 border-2 border-blue-200'>
                        <h4 className='font-bold text-gray-900 text-lg mb-4'>
                          📊 Detailed Evaluation
                        </h4>

                        {/* Criterion Ratings */}
                        <div className='space-y-4'>
                          {DEFAULT_EVALUATION_CRITERIA.map((criterion) => (
                            <CriterionRating
                              key={criterion.id}
                              criterion={criterion}
                              value={
                                detailedRatings[message.id]?.[criterion.id] || 0
                              }
                              onChange={(value) =>
                                setDetailedRatings({
                                  ...detailedRatings,
                                  [message.id]: {
                                    ...(detailedRatings[message.id] || {}),
                                    [criterion.id]: value,
                                  },
                                })
                              }
                            />
                          ))}
                        </div>

                        {/* Issue Flagging */}
                        <IssueFlagging
                          selectedIssues={messageIssues[message.id] || []}
                          onChange={(issues) =>
                            setMessageIssues({
                              ...messageIssues,
                              [message.id]: issues,
                            })
                          }
                        />

                        {/* Overall Score Display */}
                        {detailedRatings[message.id] &&
                          Object.keys(detailedRatings[message.id]).length >
                            0 && (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                              <div className='text-center'>
                                <div className='text-sm text-gray-700 mb-1'>
                                  Overall Score:
                                </div>
                                <div className='text-3xl font-bold text-blue-600'>
                                  {calculateOverallScore(
                                    detailedRatings[message.id],
                                    DEFAULT_EVALUATION_CRITERIA
                                  ).toFixed(1)}
                                  /5.0
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Save Button */}
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            onClick={() => setExpandedMessageId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveDetailedRating(message.id)}
                            disabled={
                              !detailedRatings[message.id] ||
                              Object.keys(detailedRatings[message.id])
                                .length === 0
                            }
                          >
                            Save Detailed Review
                          </Button>
                        </div>
                      </div>
                    )}

                    {message.rating && (
                      <div className='mt-3 space-y-2'>
                        <textarea
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500'
                          rows={2}
                          placeholder='Why? (Optional feedback)'
                          value={
                            message.id === messages.find((m) => m.feedback)?.id
                              ? message.feedback
                              : feedbackText
                          }
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                        <Button
                          size='sm'
                          onClick={() => handleSaveFeedback(message.id)}
                        >
                          Save Feedback
                        </Button>
                      </div>
                    )}

                    {message.feedback && (
                      <div className='mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-gray-800'>
                        <div className='font-semibold text-gray-900 mb-1'>
                          Your Feedback:
                        </div>
                        {message.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card title='📊 Conversation Summary'>
        <div className='space-y-4'>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-semibold text-gray-900 mb-2'>Progress:</h4>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all'
                style={{
                  width: `${
                    (ratedCount / Math.max(assistantMessages.length, 1)) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className='text-sm text-gray-600 mt-2'>
              {ratedCount} of {assistantMessages.length} responses rated (
              {Math.round(
                (ratedCount / Math.max(assistantMessages.length, 1)) * 100
              )}
              %)
            </div>
          </div>

          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <h4 className='font-semibold text-gray-900 mb-2'>
              Overall Quality:
            </h4>
            <div className='text-3xl font-bold text-green-600'>
              {assistantMessages.length > 0
                ? Math.round(
                    (goodCount / Math.max(assistantMessages.length, 1)) * 100
                  )
                : 0}
              % Good
            </div>
            <div className='text-sm text-gray-700 mt-1'>
              {goodCount} good responses out of {assistantMessages.length}
            </div>
          </div>

          <div className='flex justify-between'>
            <Link href='/evaluations'>
              <Button variant='secondary'>← Back to Queue</Button>
            </Link>
            <Button
              disabled={ratedCount < assistantMessages.length}
              onClick={() => {
                alert('Conversation review completed!');
              }}
            >
              Complete Review →
            </Button>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card>
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='font-semibold text-blue-900 mb-2'>💡 Tips:</h4>
          <ul className='text-sm text-blue-800 space-y-1 list-disc list-inside'>
            <li>Rate each assistant response as Good (👍) or Bad (👎)</li>
            <li>
              Provide feedback for bad responses to help improve the chatbot
            </li>
            <li>Complete all ratings to finish the review</li>
            <li>
              Your feedback will be used to improve training data and prompts
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
