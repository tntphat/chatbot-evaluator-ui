'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DatasetStorage } from '@/lib/storage';
import type { TestDataset } from '@/lib/types';
import Link from 'next/link';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<TestDataset[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDatasets(DatasetStorage.getAll());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      DatasetStorage.delete(id);
      loadData();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Test Datasets</h1>
          <p className='mt-2 text-gray-800'>
            Manage your evaluation test datasets
          </p>
        </div>
        <Link href='/datasets/new'>
          <Button>+ New Dataset</Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {datasets.length === 0 ? (
          <Card className='col-span-full'>
            <div className='text-center py-12'>
              <p className='text-gray-700 text-lg'>No datasets found</p>
              <p className='text-gray-800 mt-2'>
                Create your first test dataset
              </p>
              <Link href='/datasets/new'>
                <Button className='mt-4'>+ Create Dataset</Button>
              </Link>
            </div>
          </Card>
        ) : (
          datasets.map((dataset) => (
            <Card
              key={dataset.id}
              className='hover:shadow-lg transition-shadow'
            >
              <div className='space-y-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                      {dataset.name}
                    </h3>
                    <Badge variant='info'>{dataset.type.toUpperCase()}</Badge>
                  </div>
                  <span className='text-2xl'>📚</span>
                </div>

                <p className='text-sm text-gray-800 line-clamp-2'>
                  {dataset.description}
                </p>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-3 bg-blue-50 rounded-lg'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {dataset.itemCount}
                    </p>
                    <p className='text-xs text-gray-800 mt-1 font-medium'>
                      Items
                    </p>
                  </div>
                  <div className='text-center p-3 bg-purple-50 rounded-lg'>
                    <p className='text-2xl font-bold text-purple-600'>
                      {dataset.version}
                    </p>
                    <p className='text-xs text-gray-800 mt-1 font-medium'>
                      Version
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap gap-1'>
                  {dataset.tags.map((tag) => (
                    <Badge key={tag} variant='neutral' size='sm'>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className='text-sm text-gray-800 font-medium'>
                  📅 Updated: {new Date(dataset.updatedAt).toLocaleDateString()}
                </div>

                <div className='flex gap-2 pt-2 border-t border-gray-200'>
                  <Link href={`/datasets/${dataset.id}`} className='flex-1'>
                    <Button size='sm' className='w-full'>
                      View
                    </Button>
                  </Link>
                  <Button
                    size='sm'
                    variant='danger'
                    onClick={() => handleDelete(dataset.id)}
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
