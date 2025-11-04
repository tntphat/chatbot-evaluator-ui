'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DatasetStorage } from '@/lib/storage';
import type { TestDataset } from '@/lib/types';
import Link from 'next/link';

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dataset, setDataset] = useState<TestDataset | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    const id = params.id as string;
    const datasetData = DatasetStorage.getById(id);

    if (!datasetData) {
      alert('Dataset not found!');
      router.push('/datasets');
      return;
    }

    setDataset(datasetData);
  }, [params.id, router]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      DatasetStorage.delete(params.id as string);
      alert('Dataset deleted!');
      router.push('/datasets');
    }
  };

  const handleExport = () => {
    if (!dataset) return;

    const text =
      dataset.items
        ?.map((item) => `${item.question} | ${item.expectedAnswer}`)
        .join('\n') || '';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/\s/g, '_')}_v${dataset.version}.txt`;
    a.click();
  };

  if (!dataset) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-gray-700 text-lg'>Loading dataset...</p>
        </div>
      </div>
    );
  }

  const categories = dataset.items
    ? [...new Set(dataset.items.map((i) => i.category).filter(Boolean))]
    : [];

  const filteredItems =
    dataset.items?.filter((item) => {
      if (filterCategory !== 'all' && item.category !== filterCategory)
        return false;
      if (filterDifficulty !== 'all' && item.difficulty !== filterDifficulty)
        return false;
      return true;
    }) || [];

  const difficultyCount = {
    easy: dataset.items?.filter((i) => i.difficulty === 'easy').length || 0,
    medium: dataset.items?.filter((i) => i.difficulty === 'medium').length || 0,
    hard: dataset.items?.filter((i) => i.difficulty === 'hard').length || 0,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/datasets'>
            <Button variant='ghost' size='sm'>
              ← Back
            </Button>
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold text-gray-900'>
                {dataset.name}
              </h1>
              <Badge variant='info'>{dataset.type.toUpperCase()}</Badge>
            </div>
            <p className='mt-2 text-gray-800'>{dataset.description}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='secondary'
            onClick={handleExport}
            disabled={!dataset.items || dataset.items.length === 0}
          >
            📥 Export Items
          </Button>
          <Button variant='danger' onClick={handleDelete}>
            🗑️ Delete Dataset
          </Button>
        </div>
      </div>

      {/* Dataset Info */}
      <Card title='Dataset Information'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          <div>
            <p className='text-sm font-semibold text-gray-700'>Type</p>
            <p className='mt-1 text-base font-medium text-gray-900'>
              {dataset.type.toUpperCase()}
            </p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-700'>Total Items</p>
            <p className='mt-1 text-base font-medium text-gray-900'>
              {dataset.itemCount}
            </p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-700'>Version</p>
            <p className='mt-1 text-base font-medium text-gray-900'>
              {dataset.version}
            </p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-700'>Created</p>
            <p className='mt-1 text-base font-medium text-gray-900'>
              {new Date(dataset.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className='mt-6'>
          <p className='text-sm font-semibold text-gray-700 mb-2'>Tags</p>
          <div className='flex flex-wrap gap-2'>
            {dataset.tags.map((tag) => (
              <Badge key={tag} variant='neutral' size='sm'>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600'>
              {dataset.itemCount}
            </div>
            <div className='text-sm text-gray-800 mt-2 font-medium'>
              Total Items
            </div>
          </div>
        </Card>
        <Card>
          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600'>
              {difficultyCount.easy}
            </div>
            <div className='text-sm text-gray-800 mt-2 font-medium'>Easy</div>
          </div>
        </Card>
        <Card>
          <div className='text-center'>
            <div className='text-3xl font-bold text-yellow-600'>
              {difficultyCount.medium}
            </div>
            <div className='text-sm text-gray-800 mt-2 font-medium'>Medium</div>
          </div>
        </Card>
        <Card>
          <div className='text-center'>
            <div className='text-3xl font-bold text-red-600'>
              {difficultyCount.hard}
            </div>
            <div className='text-sm text-gray-800 mt-2 font-medium'>Hard</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      {dataset.items && dataset.items.length > 0 && (
        <Card title='Filters'>
          <div className='flex flex-wrap gap-3'>
            <div className='flex gap-2 items-center'>
              <span className='text-sm font-semibold text-gray-800'>
                Category:
              </span>
              <Button
                size='sm'
                variant={filterCategory === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilterCategory('all')}
              >
                All ({dataset.items?.length || 0})
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size='sm'
                  variant={filterCategory === cat ? 'primary' : 'ghost'}
                  onClick={() => setFilterCategory(cat || 'all')}
                >
                  {cat} (
                  {dataset.items?.filter((i) => i.category === cat).length || 0}
                  )
                </Button>
              ))}
            </div>

            <div className='flex gap-2 items-center ml-4'>
              <span className='text-sm font-semibold text-gray-800'>
                Difficulty:
              </span>
              <Button
                size='sm'
                variant={filterDifficulty === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilterDifficulty('all')}
              >
                All
              </Button>
              <Button
                size='sm'
                variant={filterDifficulty === 'easy' ? 'primary' : 'ghost'}
                onClick={() => setFilterDifficulty('easy')}
              >
                Easy ({difficultyCount.easy})
              </Button>
              <Button
                size='sm'
                variant={filterDifficulty === 'medium' ? 'primary' : 'ghost'}
                onClick={() => setFilterDifficulty('medium')}
              >
                Medium ({difficultyCount.medium})
              </Button>
              <Button
                size='sm'
                variant={filterDifficulty === 'hard' ? 'primary' : 'ghost'}
                onClick={() => setFilterDifficulty('hard')}
              >
                Hard ({difficultyCount.hard})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Test Items */}
      <Card
        title='Test Items'
        subtitle={`${filteredItems.length} of ${dataset.itemCount} items`}
      >
        <div className='space-y-4'>
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className='p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all'
              >
                <div className='flex items-start justify-between mb-3'>
                  <span className='text-sm font-bold text-gray-700'>
                    #{idx + 1}
                  </span>
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
                        {item.difficulty.toUpperCase()}
                      </Badge>
                    )}
                    {item.category && (
                      <Badge variant='neutral' size='sm'>
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {item.question && (
                  <div className='mb-3'>
                    <p className='text-sm font-bold text-gray-800 mb-2'>
                      ❓ Question:
                    </p>
                    <p className='text-base text-gray-900 leading-relaxed'>
                      {item.question}
                    </p>
                  </div>
                )}

                {item.expectedAnswer && (
                  <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                    <p className='text-sm font-bold text-gray-800 mb-2'>
                      ✅ Expected Answer:
                    </p>
                    <p className='text-base text-gray-900 leading-relaxed'>
                      {item.expectedAnswer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : dataset.items && dataset.items.length > 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-700 text-lg'>
                No items match the current filters
              </p>
              <Button
                variant='ghost'
                className='mt-4'
                onClick={() => {
                  setFilterCategory('all');
                  setFilterDifficulty('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className='text-center py-12 text-gray-700'>
              <p className='text-lg'>No items in this dataset</p>
              <p className='text-sm mt-2'>
                This is a placeholder dataset. Items would be loaded from the
                database.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
