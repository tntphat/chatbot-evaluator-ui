'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
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

export default function EvaluationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quickRating, setQuickRating] = useState<'like' | 'dislike' | null>(
    null
  );

  const [ratings, setRatings] = useState({
    accuracy: 0,
    completeness: 0,
    relevance: 0,
    clarity: 0,
    tone: 0,
    citations: 0,
  });

  const [issueFlags, setIssueFlags] = useState<IssueFlag[]>([]);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock test data (in real app, load from campaign/dataset)
  const testQuestions = [
    {
      id: 'q001',
      question: 'Nhân viên mới được hưởng chế độ nghỉ phép sau bao lâu?',
      expectedAnswer:
        'Nhân viên mới được hưởng chế độ nghỉ phép sau khi hoàn thành thời gian thử việc (2 tháng). Trong năm đầu tiên, nhân viên được 12 ngày phép năm.',
      keyPoints: [
        'Thời gian thử việc: 2 tháng',
        'Số ngày phép năm: 12 ngày',
        'Áp dụng từ năm đầu tiên',
      ],
      category: 'Leave Policy',
      priority: 'high',
    },
    {
      id: 'q002',
      question: 'Chính sách làm overtime cuối tuần như thế nào?',
      expectedAnswer:
        'Theo chính sách công ty, nhân viên làm OT cuối tuần (T7, CN) sẽ được trả lương gấp 2 lần mức lương cơ bản. OT vào ngày lễ được trả gấp 3 lần.',
      keyPoints: ['Weekend OT: 2x pay', 'Holiday OT: 3x pay'],
      category: 'Salary',
      priority: 'high',
    },
    {
      id: 'q003',
      question: 'Quy trình xin nghỉ phép như thế nào?',
      expectedAnswer:
        'Nhân viên cần gửi đơn xin nghỉ phép trên hệ thống HR ít nhất 3 ngày trước. Quản lý trực tiếp sẽ phê duyệt trong vòng 24 giờ. Với nghỉ đột xuất, vui lòng liên hệ quản lý qua điện thoại.',
      keyPoints: [
        'Gửi đơn trước 3 ngày',
        'Quản lý phê duyệt trong 24h',
        'Nghỉ đột xuất: liên hệ quản lý',
      ],
      category: 'Leave Policy',
      priority: 'medium',
    },
  ];

  const currentQuestion = testQuestions[currentQuestionIndex];

  // Mock chatbot response (in real app, call chatbot API)
  const mockChatbotResponses = [
    'Nhân viên mới sẽ được hưởng chế độ nghỉ phép sau khi hoàn thành thời gian thử việc là 2 tháng. Sau đó, bạn sẽ được cấp 12 ngày phép năm. Số ngày phép này sẽ được tính từ năm đầu tiên bạn làm việc tại công ty.\n\nNếu bạn cần thêm thông tin, vui lòng tham khảo Employee Handbook tại: https://wiki.company.com/handbook',
    'Nhân viên làm OT cuối tuần sẽ được trả lương gấp 1.5 lần mức lương cơ bản. Nếu làm OT vào ngày lễ thì sẽ được trả gấp 2 lần.', // Has factual error!
    'Để xin nghỉ phép, bạn cần gửi đơn trên hệ thống HR. Quản lý sẽ phê duyệt đơn của bạn. Nếu cần nghỉ gấp, hãy liên hệ quản lý.', // Incomplete
  ];

  const chatbotResponse = mockChatbotResponses[currentQuestionIndex];

  const handleSaveAndNext = () => {
    // Validate at least quick rating or one criterion rated
    if (!quickRating && Object.values(ratings).every((r) => r === 0)) {
      alert('Please provide at least a quick rating or rate one criterion!');
      return;
    }

    // Calculate overall score
    const overallScore = calculateOverallScore(
      ratings,
      DEFAULT_EVALUATION_CRITERIA
    );

    console.log('Evaluation saved:', {
      questionId: currentQuestion.id,
      quickRating,
      ratings,
      overallScore,
      issueFlags,
      comments,
    });

    // Move to next question or complete
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset form
      setQuickRating(null);
      setRatings({
        accuracy: 0,
        completeness: 0,
        relevance: 0,
        clarity: 0,
        tone: 0,
        citations: 0,
      });
      setIssueFlags([]);
      setComments('');
    } else {
      setSubmitted(true);
      alert('All evaluations completed!');
      setTimeout(() => router.push('/evaluations'), 1500);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.push('/evaluations');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const overallScore = calculateOverallScore(
    ratings,
    DEFAULT_EVALUATION_CRITERIA
  );
  const hasRating = Object.values(ratings).some((r) => r > 0);

  if (submitted) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='max-w-md'>
          <div className='text-center py-8'>
            <div className='text-6xl mb-4'>🎉</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Evaluation Complete!
            </h2>
            <p className='text-gray-800'>
              All questions evaluated. Redirecting to summary...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/evaluations'>
            <Button variant='ghost' size='sm'>
              ⏸ Pause & Save
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Manual Evaluation
            </h1>
            <p className='text-gray-700'>
              Campaign: HR Policy Q&A Test | Chatbot: HR Assistant Bot v2.3
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-semibold text-gray-700'>
              Progress: Question {currentQuestionIndex + 1} of{' '}
              {testQuestions.length}
            </span>
            <span className='text-sm text-gray-600'>
              {Math.round(
                ((currentQuestionIndex + 1) / testQuestions.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-blue-600 h-3 rounded-full transition-all'
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / testQuestions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Question Panel */}
      <Card title={`Question ${currentQuestionIndex + 1}`}>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            {currentQuestion.priority === 'high' && (
              <Badge variant='error'>🔴 High Priority</Badge>
            )}
            <Badge variant='neutral'>{currentQuestion.category}</Badge>
          </div>

          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-lg font-semibold text-gray-900'>
              {currentQuestion.question}
            </p>
          </div>
        </div>
      </Card>

      {/* Chatbot Response */}
      <Card title='🤖 Chatbot Response'>
        <div className='space-y-4'>
          <div className='p-4 bg-white border border-gray-300 rounded-lg'>
            <p className='text-gray-900 leading-relaxed whitespace-pre-wrap'>
              {chatbotResponse}
            </p>
          </div>

          {/* Quick Rating */}
          <div className='flex justify-center gap-4'>
            <button
              type='button'
              onClick={() => setQuickRating('like')}
              className={`px-8 py-4 rounded-lg border-2 transition-all ${
                quickRating === 'like'
                  ? 'border-green-500 bg-green-50 text-green-700 scale-105'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
              }`}
            >
              <span className='text-3xl'>👍</span>
              <div className='text-sm font-semibold mt-1'>Like</div>
            </button>
            <button
              type='button'
              onClick={() => setQuickRating('dislike')}
              className={`px-8 py-4 rounded-lg border-2 transition-all ${
                quickRating === 'dislike'
                  ? 'border-red-500 bg-red-50 text-red-700 scale-105'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-400'
              }`}
            >
              <span className='text-3xl'>👎</span>
              <div className='text-sm font-semibold mt-1'>Dislike</div>
            </button>
          </div>
        </div>
      </Card>

      {/* Expected Answer Reference */}
      <Card title='✅ Expected Answer (Reference)'>
        <div className='space-y-3'>
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-gray-900 leading-relaxed'>
              {currentQuestion.expectedAnswer}
            </p>
          </div>

          {currentQuestion.keyPoints &&
            currentQuestion.keyPoints.length > 0 && (
              <div>
                <p className='text-sm font-semibold text-gray-700 mb-2'>
                  Key Points to Cover:
                </p>
                <div className='space-y-1'>
                  {currentQuestion.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className='flex items-start gap-2 text-sm text-gray-800'
                    >
                      <span className='text-green-600'>☑</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* Detailed Rating */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-gray-900'>
            Detailed Rating by Criteria
          </h3>
          {hasRating && (
            <div className='text-right'>
              <div className='text-sm text-gray-600'>Overall Score:</div>
              <div className='text-2xl font-bold text-blue-600'>
                {overallScore.toFixed(1)}/5.0
              </div>
            </div>
          )}
        </div>

        {DEFAULT_EVALUATION_CRITERIA.map((criterion) => (
          <CriterionRating
            key={criterion.id}
            criterion={criterion}
            value={ratings[criterion.id as keyof typeof ratings] || 0}
            onChange={(value) =>
              setRatings({
                ...ratings,
                [criterion.id]: value,
              })
            }
          />
        ))}
      </div>

      {/* Feedback */}
      <Card title='📝 Your Feedback'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-800 mb-2'>
              Comments (optional but recommended)
            </label>
            <textarea
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
              rows={4}
              placeholder="Provide detailed feedback about this response. What's good? What needs improvement?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <p className='text-xs text-gray-600 mt-1'>
              {comments.length}/500 characters
            </p>
          </div>
        </div>
      </Card>

      {/* Issue Flagging */}
      <IssueFlagging selectedIssues={issueFlags} onChange={setIssueFlags} />

      {/* Navigation */}
      <Card>
        <div className='flex justify-between items-center'>
          <Button
            type='button'
            variant='ghost'
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </Button>

          <div className='flex gap-3'>
            <Button type='button' variant='secondary' onClick={handleSkip}>
              Skip Question
            </Button>
            <Button type='button' onClick={handleSaveAndNext}>
              {currentQuestionIndex < testQuestions.length - 1
                ? 'Save & Next →'
                : 'Complete Evaluation'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Help */}
      <Card>
        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <h4 className='text-sm font-semibold text-yellow-900 mb-2'>
            💡 Evaluation Tips:
          </h4>
          <ul className='text-sm text-yellow-800 space-y-1'>
            <li>• Use Quick Rating (👍/👎) for rapid evaluation</li>
            <li>• Detailed ratings provide better insights for improvement</li>
            <li>• Flag issues to help identify patterns</li>
            <li>• Comments help explain your ratings</li>
            <li>• You can pause and resume anytime (auto-saved)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}


