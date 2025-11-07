'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DatasetStorage } from '@/lib/storage';
import type { TestDataset, TestItem } from '@/lib/types';
import Link from 'next/link';

interface EditableTestItem extends TestItem {
  question: string;
  expectedAnswer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function EditDatasetPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'qa' as 'qa' | 'conversation' | 'custom',
    tags: '',
    category: '',
  });

  const [items, setItems] = useState<EditableTestItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditableTestItem | null>(null);

  useEffect(() => {
    const dataset = DatasetStorage.getById(datasetId) as TestDataset | null;
    if (dataset) {
      setFormData({
        name: dataset.name,
        description: dataset.description,
        type: dataset.type,
        tags: dataset.tags.join(', '),
        category: '',
      });
      setItems(
        dataset.items.map((item) => ({
          ...item,
          question: item.question || '',
          expectedAnswer: item.expectedAnswer || '',
          category: item.category,
          difficulty: item.difficulty,
        }))
      );
      setLoading(false);
    } else {
      alert('Dataset not found!');
      router.push('/datasets');
    }
  }, [datasetId, router]);

  const handleAddItem = () => {
    const newItem: EditableTestItem = {
      id: `item_${Date.now()}`,
      type: formData.type as 'qa' | 'conversation',
      question: '',
      expectedAnswer: '',
      category: 'general',
      difficulty: 'medium',
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
  };

  const handleUpdateItem = (id: string, field: string, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (confirm('Remove this item?')) {
      setItems(items.filter((item) => item.id !== id));
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    }
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

    const updatedDataset: TestDataset = {
      id: datasetId,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      tags: tagsArray,
      itemCount: items.length,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items,
    };

    DatasetStorage.update(datasetId, updatedDataset);
    alert('Dataset updated successfully!');
    router.push(`/datasets/${datasetId}`);
  };

  if (loading) {
    return <div className='text-center py-12'>Loading...</div>;
  }

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <div className='flex items-center gap-4'>
        <Link href={`/datasets/${datasetId}`}>
          <Button variant='ghost' size='sm'>
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Edit Dataset</h1>
          <p className='mt-2 text-gray-800'>
            Update dataset information and items
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
            </div>
          </div>
        </Card>

        {/* Edit Items */}
        <Card
          title={`Test Items (${items.length})`}
          subtitle='Edit questions and expected answers'
          action={
            <Button type='button' size='sm' onClick={handleAddItem}>
              ➕ Add New Item
            </Button>
          }
        >
          <div className='space-y-4'>
            {items.length === 0 ? (
              <div className='text-center py-8 text-gray-700'>
                <p className='text-lg'>No items yet</p>
                <Button type='button' className='mt-4' onClick={handleAddItem}>
                  Add First Item
                </Button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${
                    editingItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className='flex justify-between items-start mb-3'>
                    <span className='text-sm font-semibold text-gray-700'>
                      #{idx + 1}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() =>
                          setEditingItem(
                            editingItem?.id === item.id ? null : item
                          )
                        }
                        className='text-blue-600 hover:text-blue-800 font-semibold text-sm'
                      >
                        {editingItem?.id === item.id ? '✓ Done' : '✏️ Edit'}
                      </button>
                      <button
                        type='button'
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-red-600 hover:text-red-800 font-semibold text-sm'
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>

                  {editingItem?.id === item.id ? (
                    <div className='space-y-3'>
                      <div>
                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                          Question / Prompt *
                        </label>
                        <input
                          type='text'
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900'
                          value={item.question}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'question',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                          Expected Answer *
                        </label>
                        <textarea
                          className='w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900'
                          rows={3}
                          value={item.expectedAnswer}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'expectedAnswer',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label className='block text-xs font-semibold text-gray-700 mb-1'>
                            Category
                          </label>
                          <input
                            type='text'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900'
                            value={item.category || ''}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'category',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-semibold text-gray-700 mb-1'>
                            Difficulty
                          </label>
                          <select
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900'
                            value={item.difficulty || 'medium'}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'difficulty',
                                e.target.value
                              )
                            }
                          >
                            <option value='easy'>Easy</option>
                            <option value='medium'>Medium</option>
                            <option value='hard'>Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <div>
                        <p className='text-xs font-semibold text-gray-700 mb-1'>
                          Q:
                        </p>
                        <p className='text-sm text-gray-900'>
                          {item.question || '(No question)'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-semibold text-gray-700 mb-1'>
                          A:
                        </p>
                        <p className='text-sm text-gray-800'>
                          {item.expectedAnswer || '(No answer)'}
                        </p>
                      </div>
                      <div className='flex gap-2 mt-2'>
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
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className='flex gap-3 justify-end'>
          <Link href={`/datasets/${datasetId}`}>
            <Button type='button' variant='ghost'>
              Cancel
            </Button>
          </Link>
          <Button type='submit' disabled={items.length === 0}>
            💾 Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}







