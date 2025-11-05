'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function EvaluationReviewPage() {
  const router = useRouter();
  const [ratings, setRatings] = useState({
    overallQuality: 0,
    coherence: 0,
    helpfulness: 0,
    fluency: 0,
    empathy: 0,
  });
  const [issues, setIssues] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock conversation data
  const conversation = {
    id: 'eval_001',
    chatbot: 'Customer Support Bot v2.1',
    turns: [
      {
        speaker: 'user',
        message: 'Tôi muốn hủy đơn hàng',
        timestamp: '10:30:00',
      },
      {
        speaker: 'bot',
        message: 'Vui lòng cho tôi biết mã đơn hàng của bạn',
        timestamp: '10:30:05',
      },
      {
        speaker: 'user',
        message: 'DH123456',
        timestamp: '10:30:15',
      },
      {
        speaker: 'bot',
        message:
          'Đơn hàng DH123456 đã được hủy thành công. Số tiền sẽ được hoàn về tài khoản của bạn trong 3-5 ngày làm việc.',
        timestamp: '10:30:20',
      },
      {
        speaker: 'user',
        message: 'Cảm ơn!',
        timestamp: '10:30:25',
      },
      {
        speaker: 'bot',
        message:
          'Rất vui được hỗ trợ bạn! Nếu có thắc mắc gì, đừng ngần ngại liên hệ lại nhé.',
        timestamp: '10:30:30',
      },
    ],
  };

  const issueOptions = [
    'Hallucination (thông tin sai)',
    'Toxic content',
    'Off-topic (ngoài chủ đề)',
    'Incorrect information',
    'Grammar/spelling errors',
    'Lack of empathy',
    'Too verbose (dài dòng)',
    'Too brief (quá ngắn)',
  ];

  const toggleIssue = (issue: string) => {
    setIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleRating = (metric: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [metric]: value }));
  };

  const handleSubmit = () => {
    if (ratings.overallQuality === 0) {
      alert('Please provide an overall quality rating!');
      return;
    }

    // Would save to backend/localStorage here
    console.log('Evaluation submitted:', { ratings, issues, comments });
    alert('Evaluation submitted successfully!');
    setSubmitted(true);

    // Redirect after 1 second
    setTimeout(() => {
      router.push('/evaluations');
    }, 1000);
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() => onChange(star)}
          className='text-2xl transition-transform hover:scale-110'
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='max-w-md'>
          <div className='text-center py-8'>
            <div className='text-6xl mb-4'>✅</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Evaluation Submitted!
            </h2>
            <p className='text-gray-800'>
              Thank you for your review. Redirecting...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/evaluations'>
            <Button variant='ghost' size='sm'>
              ← Back to Queue
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Review Conversation
            </h1>
            <p className='mt-2 text-gray-800'>{conversation.chatbot}</p>
          </div>
        </div>
        <Badge variant='info'>IN REVIEW</Badge>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Conversation */}
        <div className='space-y-4'>
          <Card title='Conversation' subtitle='Review the chatbot interaction'>
            <div className='space-y-4 max-h-[600px] overflow-y-auto'>
              {conversation.turns.map((turn, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    turn.speaker === 'user'
                      ? 'bg-blue-50 ml-8'
                      : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='font-semibold text-sm'>
                      {turn.speaker === 'user' ? '👤 User' : '🤖 Bot'}
                    </span>
                    <span className='text-xs text-gray-700'>
                      {turn.timestamp}
                    </span>
                  </div>
                  <p className='text-gray-900'>{turn.message}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title='Metadata'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-800'>Conversation ID:</span>
                <span className='font-mono text-gray-900'>
                  {conversation.id}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-800'>Chatbot:</span>
                <span className='text-gray-900'>{conversation.chatbot}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-800'>Turns:</span>
                <span className='text-gray-900'>
                  {conversation.turns.length}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-800'>Duration:</span>
                <span className='text-gray-900'>30 seconds</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-800'>Task:</span>
                <Badge variant='success' size='sm'>
                  Completed
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Evaluation Form */}
        <div className='space-y-4'>
          <Card
            title='Evaluation Form'
            subtitle='Rate the conversation quality'
          >
            <div className='space-y-6'>
              {/* Ratings */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Overall Quality *
                </label>
                <StarRating
                  value={ratings.overallQuality}
                  onChange={(v) => handleRating('overallQuality', v)}
                />
                <p className='text-xs text-gray-700 mt-1'>
                  {ratings.overallQuality === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                  {ratings.overallQuality === 4 && 'Good ⭐⭐⭐⭐'}
                  {ratings.overallQuality === 3 && 'OK ⭐⭐⭐'}
                  {ratings.overallQuality === 2 && 'Below expectations ⭐⭐'}
                  {ratings.overallQuality === 1 && 'Poor ⭐'}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Coherence (Mạch lạc)
                </label>
                <StarRating
                  value={ratings.coherence}
                  onChange={(v) => handleRating('coherence', v)}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Helpfulness (Hữu ích)
                </label>
                <StarRating
                  value={ratings.helpfulness}
                  onChange={(v) => handleRating('helpfulness', v)}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Fluency (Trôi chảy)
                </label>
                <StarRating
                  value={ratings.fluency}
                  onChange={(v) => handleRating('fluency', v)}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Empathy (Đồng cảm)
                </label>
                <StarRating
                  value={ratings.empathy}
                  onChange={(v) => handleRating('empathy', v)}
                />
              </div>
            </div>
          </Card>

          <Card title='Issues Found'>
            <div className='space-y-2'>
              {issueOptions.map((issue) => (
                <label
                  key={issue}
                  className='flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer'
                >
                  <input
                    type='checkbox'
                    className='w-4 h-4'
                    checked={issues.includes(issue)}
                    onChange={() => toggleIssue(issue)}
                  />
                  <span className='text-sm text-gray-900'>{issue}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card title='Comments'>
            <textarea
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
              rows={6}
              placeholder='Add any additional comments or observations...'
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Card>

          {/* Actions */}
          <div className='flex gap-3'>
            <Link href='/evaluations' className='flex-1'>
              <Button variant='ghost' className='w-full'>
                Skip
              </Button>
            </Link>
            <Button
              variant='secondary'
              className='flex-1'
              onClick={() => {
                // Save draft
                alert('Draft saved!');
              }}
            >
              Save Draft
            </Button>
            <Button className='flex-1' onClick={handleSubmit}>
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


