'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DatasetStorage } from '@/lib/storage';
import Link from 'next/link';

interface TestItem {
  id: string;
  question: string;
  expectedAnswer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function NewDatasetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'qa' as 'qa' | 'conversation' | 'custom',
    tags: '',
    category: '',
  });

  const [items, setItems] = useState<TestItem[]>([]);
  const [currentItem, setCurrentItem] = useState<TestItem>({
    id: '',
    question: '',
    expectedAnswer: '',
    category: '',
    difficulty: 'medium',
  });

  const [importMode, setImportMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAddItem = () => {
    if (!currentItem.question || !currentItem.expectedAnswer) {
      alert('Please fill question and answer!');
      return;
    }

    const newItem = {
      ...currentItem,
      id: `item_${Date.now()}`,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      id: '',
      question: '',
      expectedAnswer: '',
      category: currentItem.category || formData.category,
      difficulty: 'medium',
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleImportBulk = () => {
    const lines = bulkText.split('\n').filter((line) => line.trim());
    const newItems: TestItem[] = [];

    lines.forEach((line, idx) => {
      const [question, answer] = line.split('|').map((s) => s.trim());
      if (question && answer) {
        newItems.push({
          id: `item_${Date.now()}_${idx}`,
          question,
          expectedAnswer: answer,
          category: formData.category,
          difficulty: 'medium',
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
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: item.id,
        type: formData.type,
        question: item.question,
        expectedAnswer: item.expectedAnswer,
        category: item.category || 'general',
        difficulty: item.difficulty || 'medium',
      })),
    };

    DatasetStorage.add(newDataset);
    alert('Dataset created successfully!');
    router.push('/datasets');
  };

  const exportItems = () => {
    const text = items
      .map((item) => `${item.question} | ${item.expectedAnswer}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'dataset'}_items.txt`;
    a.click();
  };

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
            Create a new dataset for chatbot evaluation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Info */}
        <Card title='Dataset Information'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-gray-800 mb-2'>
                Dataset Name *
              </label>
              <input
                type='text'
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600 text-base'
                placeholder='e.g., Product Support Q&A - November 2024'
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
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600 text-base'
                rows={3}
                placeholder='Describe what this dataset contains and its purpose...'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-800 mb-2'>
                Type
              </label>
              <select
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base'
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'qa' | 'conversation' | 'custom',
                  })
                }
              >
                <option value='qa'>Q&A (Question & Answer)</option>
                <option value='conversation'>Conversation (Multi-turn)</option>
                <option value='custom'>Custom Format</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-800 mb-2'>
                Default Category
              </label>
              <input
                type='text'
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600 text-base'
                placeholder='e.g., support, product, billing'
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <p className='mt-1 text-xs text-gray-700'>
                Default category for all items (can override per item)
              </p>
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-gray-800 mb-2'>
                Tags (comma separated)
              </label>
              <input
                type='text'
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600 text-base'
                placeholder='e.g., customer-support, product-info, troubleshooting'
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
              <p className='mt-1 text-xs text-gray-700'>
                Use tags to organize and filter datasets
              </p>
            </div>
          </div>
        </Card>

        {/* Add Test Items */}
        <Card
          title={`Test Items (${items.length})`}
          subtitle='Add questions and expected answers'
          action={
            <div className='flex gap-2'>
              {items.length > 0 && (
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={exportItems}
                >
                  📥 Export
                </Button>
              )}
              <Button
                type='button'
                size='sm'
                variant='secondary'
                onClick={() => setImportMode(!importMode)}
              >
                {importMode ? 'Manual Entry' : '📤 Bulk Import'}
              </Button>
            </div>
          }
        >
          {!importMode ? (
            <div className='space-y-4'>
              {/* Add Item Form */}
              <div className='p-4 bg-blue-50 border-2 border-blue-200 rounded-lg'>
                <h4 className='font-semibold text-gray-900 mb-4'>
                  Add New Item
                </h4>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-800 mb-1'>
                      Question / Prompt *
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
                      placeholder='Enter the question or prompt...'
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
                      Expected Answer / Response *
                    </label>
                    <textarea
                      className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
                      rows={3}
                      placeholder='Enter the expected answer or response...'
                      value={currentItem.expectedAnswer}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          expectedAnswer: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-800 mb-1'>
                        Category (optional)
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
                        placeholder={formData.category || 'e.g., refund'}
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
                        Difficulty
                      </label>
                      <select
                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
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
                    ➕ Add Item
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='font-semibold text-gray-900'>
                    Items Added ({items.length})
                  </h4>
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className='p-4 border border-gray-300 rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <span className='text-sm font-semibold text-gray-700'>
                          #{idx + 1}
                        </span>
                        <div className='flex gap-2 items-center'>
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
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-xs font-semibold text-gray-700 mb-1'>
                            Q:
                          </p>
                          <p className='text-sm text-gray-900'>
                            {item.question}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs font-semibold text-gray-700 mb-1'>
                            A:
                          </p>
                          <p className='text-sm text-gray-800'>
                            {item.expectedAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <div className='text-center py-8 text-gray-700'>
                  <p className='text-lg'>No items added yet</p>
                  <p className='text-sm mt-1'>
                    Use the form above to add your first test item
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
                <p className='text-sm text-gray-800 mb-4'>
                  Paste your items in format:{' '}
                  <code className='bg-white px-2 py-1 rounded'>
                    Question | Answer
                  </code>
                  <br />
                  One item per line. Example:
                </p>
                <div className='bg-white p-2 rounded border border-gray-300 text-sm text-gray-900 font-mono'>
                  What is your refund policy? | We offer 30-day full refund
                  <br />
                  How to track order? | Go to My Orders section
                </div>
              </div>

              <textarea
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600 font-mono text-sm'
                rows={10}
                placeholder='Paste your items here (one per line)...'
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

        {/* Summary */}
        {items.length > 0 && (
          <Card title='Summary'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='text-3xl font-bold text-blue-600'>
                  {items.length}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Total Items</div>
              </div>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='text-3xl font-bold text-green-600'>
                  {items.filter((i) => i.difficulty === 'easy').length}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Easy</div>
              </div>
              <div className='text-center p-4 bg-yellow-50 rounded-lg'>
                <div className='text-3xl font-bold text-yellow-600'>
                  {items.filter((i) => i.difficulty === 'medium').length}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Medium</div>
              </div>
              <div className='text-center p-4 bg-red-50 rounded-lg'>
                <div className='text-3xl font-bold text-red-600'>
                  {items.filter((i) => i.difficulty === 'hard').length}
                </div>
                <div className='text-sm text-gray-800 mt-1'>Hard</div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className='flex gap-3 justify-end'>
          <Link href='/datasets'>
            <Button type='button' variant='ghost'>
              Cancel
            </Button>
          </Link>
          <Button type='submit' disabled={items.length === 0}>
            Create Dataset ({items.length} items)
          </Button>
        </div>
      </form>
    </div>
  );
}
