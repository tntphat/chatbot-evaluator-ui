'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CriteriaSetup } from '@/components/CriteriaSetup';
import { DatasetStorage } from '@/lib/storage';
import { DEFAULT_EVALUATION_CRITERIA } from '@/lib/defaultCriteria';
import { EvaluationCriterion, TestItem } from '@/lib/types';
import Link from 'next/link';

export default function NewDatasetPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<
    'info' | 'questions' | 'criteria'
  >('info');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'qa' as 'qa' | 'conversation' | 'custom',
    tags: '',
    category: '',
    version: '1.0',
    targetChatbot: '',
  });

  const [items, setItems] = useState<TestItem[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(
    DEFAULT_EVALUATION_CRITERIA
  );

  const [currentItem, setCurrentItem] = useState({
    question: '',
    expectedAnswer: '',
    keyPoints: [] as string[],
    referenceDoc: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    priority: 'medium' as 'high' | 'medium' | 'low',
    tags: [] as string[],
  });

  const [currentKeyPoint, setCurrentKeyPoint] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAddKeyPoint = () => {
    if (currentKeyPoint.trim()) {
      setCurrentItem({
        ...currentItem,
        keyPoints: [...currentItem.keyPoints, currentKeyPoint.trim()],
      });
      setCurrentKeyPoint('');
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setCurrentItem({
      ...currentItem,
      keyPoints: currentItem.keyPoints.filter((_, i) => i !== index),
    });
  };

  const handleAddItem = () => {
    if (!currentItem.question || !currentItem.expectedAnswer) {
      alert('Please fill question and expected answer!');
      return;
    }

    const newItem: TestItem = {
      id: `item_${Date.now()}`,
      type: 'qa',
      question: currentItem.question,
      expectedAnswer: currentItem.expectedAnswer,
      keyPoints:
        currentItem.keyPoints.length > 0 ? currentItem.keyPoints : undefined,
      referenceDoc: currentItem.referenceDoc || undefined,
      category: currentItem.category || formData.category || 'general',
      difficulty: currentItem.difficulty,
      priority: currentItem.priority,
      tags: currentItem.tags.length > 0 ? currentItem.tags : undefined,
    };

    setItems([...items, newItem]);

    // Reset current item
    setCurrentItem({
      question: '',
      expectedAnswer: '',
      keyPoints: [],
      referenceDoc: '',
      category: currentItem.category,
      difficulty: 'medium',
      priority: 'medium',
      tags: [],
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleImportBulk = () => {
    const lines = bulkText.split('\n').filter((line) => line.trim());
    const newItems: TestItem[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split('|').map((s) => s.trim());
      if (parts.length >= 2) {
        const [question, answer, category] = parts;
        newItems.push({
          id: `item_${Date.now()}_${idx}`,
          type: 'qa',
          question,
          expectedAnswer: answer,
          category: category || formData.category || 'general',
          difficulty: 'medium',
          priority: 'medium',
        });
      }
    });

    setItems([...items, ...newItems]);
    setBulkText('');
    setImportMode(false);
    alert(`Imported ${newItems.length} items!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter dataset name!');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one test item!');
      return;
    }

    // Validate criteria weights
    const totalWeight = criteria
      .filter((c) => c.enabled)
      .reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      alert('Total weight of enabled criteria must equal 100%!');
      setCurrentTab('criteria');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const newDataset = {
      id: `ds_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      tags: tagsArray,
      itemCount: items.length,
      version: formData.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      evaluationCriteria: criteria,
      targetChatbot: formData.targetChatbot || undefined,
    };

    DatasetStorage.add(newDataset);
    alert(
      `Dataset "${formData.name}" created successfully with ${items.length} items!`
    );
    router.push('/datasets');
  };

  const tabClasses = (tab: typeof currentTab) =>
    `px-6 py-3 font-semibold border-b-2 transition-colors ${
      currentTab === tab
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <div className='flex items-center gap-4'>
        <Link href='/datasets'>
          <Button variant='ghost' size='sm'>
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Create Test Dataset
          </h1>
          <p className='mt-2 text-gray-800'>
            Create test suite với questions, expected answers, và evaluation
            criteria
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setCurrentTab('info')}
            className={tabClasses('info')}
          >
            📝 Basic Info
          </button>
          <button
            type='button'
            onClick={() => setCurrentTab('questions')}
            className={tabClasses('questions')}
          >
            ❓ Questions ({items.length})
          </button>
          <button
            type='button'
            onClick={() => setCurrentTab('criteria')}
            className={tabClasses('criteria')}
          >
            ⭐ Evaluation Criteria ({criteria.filter((c) => c.enabled).length})
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Tab Content */}
        {currentTab === 'info' && (
          <Card title='Dataset Information'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Dataset Name *
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='e.g., HR Policy Q&A - Version 2.0'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Description
                </label>
                <textarea
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  rows={3}
                  placeholder='Comprehensive test suite for HR chatbot covering leave, salary, and benefits policies...'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Target Chatbot (Optional)
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='e.g., HR Assistant Bot v2.3'
                  value={formData.targetChatbot}
                  onChange={(e) =>
                    setFormData({ ...formData, targetChatbot: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Version
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='e.g., 1.0, 2.0'
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Default Category
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='e.g., Leave Policy'
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2'>
                  Tags (comma separated)
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900'
                  placeholder='e.g., hr, policy, benefits'
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
            </div>

            <div className='mt-6 flex justify-end'>
              <Button type='button' onClick={() => setCurrentTab('questions')}>
                Next: Add Questions →
              </Button>
            </div>
          </Card>
        )}

        {currentTab === 'questions' && (
          <div className='space-y-6'>
            <Card
              title={`Test Questions (${items.length})`}
              subtitle='Add questions với expected answers và key points'
              action={
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={() => setImportMode(!importMode)}
                >
                  {importMode ? 'Manual Entry' : '📤 Bulk Import'}
                </Button>
              }
            >
              {!importMode ? (
                <div className='space-y-4'>
                  {/* Add Item Form */}
                  <div className='p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-4'>
                    <h4 className='font-semibold text-gray-900'>
                      Add New Question
                    </h4>

                    <div>
                      <label className='block text-sm font-semibold text-gray-800 mb-1'>
                        Question *
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                        placeholder='Nhân viên mới được hưởng chế độ nghỉ phép sau bao lâu?'
                        value={currentItem.question}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            question: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-800 mb-1'>
                        Expected Answer *
                      </label>
                      <textarea
                        className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                        rows={3}
                        placeholder='Nhân viên mới được hưởng chế độ nghỉ phép sau khi hoàn thành thời gian thử việc (2 tháng)...'
                        value={currentItem.expectedAnswer}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            expectedAnswer: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Key Points */}
                    <div>
                      <label className='block text-sm font-semibold text-gray-800 mb-1'>
                        Key Points to Cover (Optional but recommended)
                      </label>
                      <div className='flex gap-2 mb-2'>
                        <input
                          type='text'
                          className='flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                          placeholder='e.g., Thời gian thử việc: 2 tháng'
                          value={currentKeyPoint}
                          onChange={(e) => setCurrentKeyPoint(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddKeyPoint();
                            }
                          }}
                        />
                        <Button
                          type='button'
                          onClick={handleAddKeyPoint}
                          size='sm'
                        >
                          + Add
                        </Button>
                      </div>
                      {currentItem.keyPoints.length > 0 && (
                        <div className='space-y-1'>
                          {currentItem.keyPoints.map((point, idx) => (
                            <div
                              key={idx}
                              className='flex items-center gap-2 text-sm p-2 bg-white border border-gray-200 rounded'
                            >
                              <span className='text-gray-700'>☑</span>
                              <span className='flex-1 text-gray-900'>
                                {point}
                              </span>
                              <button
                                type='button'
                                onClick={() => handleRemoveKeyPoint(idx)}
                                className='text-red-600 hover:text-red-800'
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-800 mb-1'>
                        Reference Document (Optional)
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                        placeholder='e.g., Employee Handbook Section 3.2'
                        value={currentItem.referenceDoc}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            referenceDoc: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-3'>
                      <div>
                        <label className='block text-sm font-semibold text-gray-800 mb-1'>
                          Category
                        </label>
                        <input
                          type='text'
                          className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                          placeholder={formData.category || 'Leave Policy'}
                          value={currentItem.category}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-gray-800 mb-1'>
                          Priority
                        </label>
                        <select
                          className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                          value={currentItem.priority}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              priority: e.target.value as
                                | 'high'
                                | 'medium'
                                | 'low',
                            })
                          }
                        >
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                          <option value='low'>Low</option>
                        </select>
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-gray-800 mb-1'>
                          Difficulty
                        </label>
                        <select
                          className='w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900'
                          value={currentItem.difficulty}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              difficulty: e.target.value as
                                | 'easy'
                                | 'medium'
                                | 'hard',
                            })
                          }
                        >
                          <option value='easy'>Easy</option>
                          <option value='medium'>Medium</option>
                          <option value='hard'>Hard</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type='button'
                      onClick={handleAddItem}
                      className='w-full'
                    >
                      ➕ Add Question
                    </Button>
                  </div>

                  {/* Items List */}
                  {items.length > 0 && (
                    <div className='space-y-3'>
                      <h4 className='font-semibold text-gray-900'>
                        Questions Added ({items.length})
                      </h4>
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          className='p-4 border border-gray-300 rounded-lg'
                        >
                          <div className='flex justify-between items-start mb-3'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold text-gray-700'>
                                Q{idx + 1}
                              </span>
                              {item.priority === 'high' && (
                                <Badge variant='error' size='sm'>
                                  🔴 High Priority
                                </Badge>
                              )}
                            </div>
                            <div className='flex gap-2'>
                              {item.difficulty && (
                                <Badge
                                  variant={
                                    item.difficulty === 'hard'
                                      ? 'error'
                                      : item.difficulty === 'medium'
                                      ? 'warning'
                                      : 'success'
                                  }
                                  size='sm'
                                >
                                  {item.difficulty}
                                </Badge>
                              )}
                              {item.category && (
                                <Badge variant='neutral' size='sm'>
                                  {item.category}
                                </Badge>
                              )}
                              <button
                                type='button'
                                onClick={() => handleRemoveItem(item.id)}
                                className='text-red-600 hover:text-red-800 font-semibold text-sm'
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <div>
                              <p className='text-xs font-semibold text-gray-700 mb-1'>
                                Question:
                              </p>
                              <p className='text-sm text-gray-900'>
                                {item.question}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs font-semibold text-gray-700 mb-1'>
                                Expected Answer:
                              </p>
                              <p className='text-sm text-gray-800'>
                                {item.expectedAnswer}
                              </p>
                            </div>
                            {item.keyPoints && item.keyPoints.length > 0 && (
                              <div>
                                <p className='text-xs font-semibold text-gray-700 mb-1'>
                                  Key Points:
                                </p>
                                <div className='space-y-1'>
                                  {item.keyPoints.map((point, i) => (
                                    <div
                                      key={i}
                                      className='text-xs text-gray-700 flex items-start gap-1'
                                    >
                                      <span>☑</span>
                                      <span>{point}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.referenceDoc && (
                              <div>
                                <p className='text-xs font-semibold text-gray-700'>
                                  Reference: {item.referenceDoc}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {items.length === 0 && (
                    <div className='text-center py-8 text-gray-700'>
                      <p>No questions added yet</p>
                      <p className='text-sm mt-1'>
                        Use the form above to add your first question
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      📤 Bulk Import Mode
                    </h4>
                    <p className='text-sm text-gray-800 mb-2'>
                      Format:{' '}
                      <code className='bg-white px-2 py-1 rounded'>
                        Question | Answer | Category
                      </code>
                    </p>
                    <div className='bg-white p-2 rounded border text-sm text-gray-900 font-mono'>
                      Chế độ nghỉ phép là bao nhiêu? | 12 ngày phép năm | Leave
                      Policy
                    </div>
                  </div>

                  <textarea
                    className='w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 font-mono text-sm'
                    rows={10}
                    placeholder='Paste your items here...'
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />

                  <div className='flex gap-3'>
                    <Button
                      type='button'
                      onClick={handleImportBulk}
                      disabled={!bulkText.trim()}
                      className='flex-1'
                    >
                      Import Items
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => {
                        setBulkText('');
                        setImportMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className='flex justify-between'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setCurrentTab('info')}
              >
                ← Previous: Basic Info
              </Button>
              <Button
                type='button'
                onClick={() => setCurrentTab('criteria')}
                disabled={items.length === 0}
              >
                Next: Evaluation Criteria →
              </Button>
            </div>
          </div>
        )}

        {currentTab === 'criteria' && (
          <div className='space-y-6'>
            <CriteriaSetup criteria={criteria} onChange={setCriteria} />

            <div className='flex justify-between'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setCurrentTab('questions')}
              >
                ← Previous: Questions
              </Button>
              <Button type='submit'>
                Create Test Suite ({items.length} questions,{' '}
                {criteria.filter((c) => c.enabled).length} criteria)
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}


