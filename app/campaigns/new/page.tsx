'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CampaignStorage, ChatbotStorage, DatasetStorage } from '@/lib/storage';
import type { Chatbot, TestDataset } from '@/lib/types';
import Link from 'next/link';

export default function NewCampaignPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [datasets, setDatasets] = useState<TestDataset[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chatbotIds: [] as string[],
    evaluationType: [] as ('automated' | 'human')[],
    datasetId: '',
    metrics: [] as string[],
  });

  useEffect(() => {
    setChatbots(ChatbotStorage.getAll());
    setDatasets(DatasetStorage.getAll());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.chatbotIds.length === 0) {
      alert('Please fill in required fields!');
      return;
    }

    const newCampaign = {
      id: `camp_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      chatbotIds: formData.chatbotIds,
      evaluationType:
        formData.evaluationType.length > 0
          ? formData.evaluationType
          : ['automated'],
      datasetId: formData.datasetId,
      status: 'draft' as const,
      metrics:
        formData.metrics.length > 0
          ? formData.metrics
          : ['accuracy', 'quality'],
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    CampaignStorage.add(newCampaign);
    alert('Campaign created successfully!');
    router.push('/campaigns');
  };

  const toggleChatbot = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      chatbotIds: prev.chatbotIds.includes(id)
        ? prev.chatbotIds.filter((cid) => cid !== id)
        : [...prev.chatbotIds, id],
    }));
  };

  const toggleEvaluationType = (type: 'automated' | 'human') => {
    setFormData((prev) => ({
      ...prev,
      evaluationType: prev.evaluationType.includes(type)
        ? prev.evaluationType.filter((t) => t !== type)
        : [...prev.evaluationType, type],
    }));
  };

  const toggleMetric = (metric: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter((m) => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  const availableMetrics = [
    'accuracy',
    'quality',
    'taskCompletion',
    'responseTime',
    'errorRate',
    'toxicity',
    'hallucination',
  ];

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      <div className='flex items-center gap-4'>
        <Link href='/campaigns'>
          <Button variant='ghost' size='sm'>
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Create Evaluation Campaign
          </h1>
          <p className='mt-2 text-gray-800'>
            Set up a new evaluation campaign for your chatbot
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Info */}
        <Card title='Basic Information'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Campaign Name *
              </label>
              <input
                type='text'
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
                placeholder='e.g., Q4 2024 Product Launch Evaluation'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
                rows={3}
                placeholder='Brief description of this evaluation campaign...'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        {/* Select Chatbots */}
        <Card
          title='Select Chatbot(s)'
          subtitle='Choose one or more chatbots to evaluate'
        >
          <div className='space-y-3'>
            {chatbots.length === 0 ? (
              <p className='text-gray-700'>No chatbots available</p>
            ) : (
              chatbots.map((chatbot) => (
                <label
                  key={chatbot.id}
                  className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    className='w-5 h-5'
                    checked={formData.chatbotIds.includes(chatbot.id)}
                    onChange={() => toggleChatbot(chatbot.id)}
                  />
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>
                      {chatbot.name} {chatbot.version}
                    </p>
                    <p className='text-sm text-gray-800'>
                      {chatbot.description}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </Card>

        {/* Evaluation Type */}
        <Card title='Evaluation Type'>
          <div className='space-y-3'>
            <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'>
              <input
                type='checkbox'
                className='w-5 h-5'
                checked={formData.evaluationType.includes('automated')}
                onChange={() => toggleEvaluationType('automated')}
              />
              <div>
                <p className='font-medium text-gray-900'>Automated Testing</p>
                <p className='text-sm text-gray-800'>
                  Run automated metrics calculation
                </p>
              </div>
            </label>

            <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'>
              <input
                type='checkbox'
                className='w-5 h-5'
                checked={formData.evaluationType.includes('human')}
                onChange={() => toggleEvaluationType('human')}
              />
              <div>
                <p className='font-medium text-gray-900'>Human Evaluation</p>
                <p className='text-sm text-gray-800'>
                  Manual review by human evaluators
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Test Dataset */}
        <Card title='Test Dataset' subtitle='Select a dataset for testing'>
          <div>
            <select
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600'
              value={formData.datasetId}
              onChange={(e) =>
                setFormData({ ...formData, datasetId: e.target.value })
              }
            >
              <option value=''>Select dataset (optional)</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.itemCount} items)
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Metrics */}
        <Card title='Metrics to Measure'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {availableMetrics.map((metric) => (
              <label
                key={metric}
                className='flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
              >
                <input
                  type='checkbox'
                  className='w-4 h-4'
                  checked={formData.metrics.includes(metric)}
                  onChange={() => toggleMetric(metric)}
                />
                <span className='text-sm font-medium text-gray-900 capitalize'>
                  {metric}
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className='flex gap-3 justify-end'>
          <Link href='/campaigns'>
            <Button type='button' variant='ghost'>
              Cancel
            </Button>
          </Link>
          <Button type='submit'>Create Campaign</Button>
        </div>
      </form>
    </div>
  );
}
