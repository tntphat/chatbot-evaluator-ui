// LocalStorage utilities

const STORAGE_KEYS = {
  CHATBOTS: 'chatbots',
  CAMPAIGNS: 'campaigns',
  DATASETS: 'datasets',
  EVALUATIONS: 'evaluations',
  AB_TESTS: 'ab_tests',
} as const;

// Generic storage functions
export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function addToStorage<T extends { id: string }>(
  key: string,
  item: T
): void {
  const items = getFromStorage<T>(key);
  items.push(item);
  saveToStorage(key, items);
}

export function updateInStorage<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): void {
  const items = getFromStorage<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveToStorage(key, items);
  }
}

export function deleteFromStorage(key: string, id: string): void {
  const items = getFromStorage<any>(key);
  const filtered = items.filter((item: any) => item.id !== id);
  saveToStorage(key, filtered);
}

export function getByIdFromStorage<T extends { id: string }>(
  key: string,
  id: string
): T | null {
  const items = getFromStorage<T>(key);
  return items.find((item) => item.id === id) || null;
}

// Specific storage functions
export const ChatbotStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.CHATBOTS),
  getById: (id: string) => getByIdFromStorage(STORAGE_KEYS.CHATBOTS, id),
  add: (chatbot: any) => addToStorage(STORAGE_KEYS.CHATBOTS, chatbot),
  update: (id: string, updates: any) =>
    updateInStorage(STORAGE_KEYS.CHATBOTS, id, updates),
  delete: (id: string) => deleteFromStorage(STORAGE_KEYS.CHATBOTS, id),
};

export const CampaignStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.CAMPAIGNS),
  getById: (id: string) => getByIdFromStorage(STORAGE_KEYS.CAMPAIGNS, id),
  add: (campaign: any) => addToStorage(STORAGE_KEYS.CAMPAIGNS, campaign),
  update: (id: string, updates: any) =>
    updateInStorage(STORAGE_KEYS.CAMPAIGNS, id, updates),
  delete: (id: string) => deleteFromStorage(STORAGE_KEYS.CAMPAIGNS, id),
};

export const DatasetStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.DATASETS),
  getById: (id: string) => getByIdFromStorage(STORAGE_KEYS.DATASETS, id),
  add: (dataset: any) => addToStorage(STORAGE_KEYS.DATASETS, dataset),
  update: (id: string, updates: any) =>
    updateInStorage(STORAGE_KEYS.DATASETS, id, updates),
  delete: (id: string) => deleteFromStorage(STORAGE_KEYS.DATASETS, id),
};

export const EvaluationStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.EVALUATIONS),
  getByCampaign: (campaignId: string) =>
    getFromStorage(STORAGE_KEYS.EVALUATIONS).filter(
      (item: any) => item.campaignId === campaignId
    ),
  getById: (id: string) => getByIdFromStorage(STORAGE_KEYS.EVALUATIONS, id),
  add: (evaluation: any) => addToStorage(STORAGE_KEYS.EVALUATIONS, evaluation),
  update: (id: string, updates: any) =>
    updateInStorage(STORAGE_KEYS.EVALUATIONS, id, updates),
  delete: (id: string) => deleteFromStorage(STORAGE_KEYS.EVALUATIONS, id),
};

export const ABTestStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.AB_TESTS),
  getById: (id: string) => getByIdFromStorage(STORAGE_KEYS.AB_TESTS, id),
  add: (abTest: any) => addToStorage(STORAGE_KEYS.AB_TESTS, abTest),
  update: (id: string, updates: any) =>
    updateInStorage(STORAGE_KEYS.AB_TESTS, id, updates),
  delete: (id: string) => deleteFromStorage(STORAGE_KEYS.AB_TESTS, id),
};

// Initialize with mock data
export function initializeMockData() {
  if (typeof window === 'undefined') return;

  // Only initialize if empty
  if (getFromStorage(STORAGE_KEYS.CHATBOTS).length === 0) {
    const mockChatbots = [
      {
        id: 'cb_001',
        name: 'Customer Support Bot',
        version: 'v2.1',
        description: 'Handles customer inquiries and support tickets',
        status: 'active',
        createdAt: '2024-10-01T00:00:00Z',
        updatedAt: '2024-11-01T00:00:00Z',
      },
      {
        id: 'cb_002',
        name: 'Sales Assistant Bot',
        version: 'v1.5',
        description: 'Assists with product recommendations and sales',
        status: 'active',
        createdAt: '2024-09-15T00:00:00Z',
        updatedAt: '2024-10-20T00:00:00Z',
      },
      {
        id: 'cb_003',
        name: 'FAQ Bot',
        version: 'v3.0',
        description: 'Answers frequently asked questions',
        status: 'active',
        createdAt: '2024-08-01T00:00:00Z',
        updatedAt: '2024-10-30T00:00:00Z',
      },
    ];
    saveToStorage(STORAGE_KEYS.CHATBOTS, mockChatbots);
  }

  if (getFromStorage(STORAGE_KEYS.CAMPAIGNS).length === 0) {
    const mockCampaigns = [
      {
        id: 'camp_001',
        name: 'iPhone 15 Launch Q4 2024',
        description: 'Evaluate support bot for iPhone 15 launch',
        chatbotIds: ['cb_001'],
        evaluationType: ['automated', 'human'],
        datasetId: 'ds_001',
        status: 'completed',
        metrics: ['accuracy', 'taskCompletion', 'responseTime', 'quality'],
        createdAt: '2024-11-01T00:00:00Z',
        startedAt: '2024-11-01T10:00:00Z',
        completedAt: '2024-11-03T18:00:00Z',
        progress: 100,
        results: {
          totalTests: 1250,
          passedTests: 1063,
          failedTests: 187,
          passRate: 85,
          avgAccuracy: 85,
          avgResponseTime: 450,
          avgQualityScore: 4.2,
          taskCompletionRate: 92,
          errorRate: 2.5,
        },
      },
      {
        id: 'camp_002',
        name: 'Sales Bot v2.0 Testing',
        description: 'Pre-production testing for sales bot update',
        chatbotIds: ['cb_002'],
        evaluationType: ['automated'],
        datasetId: 'ds_002',
        status: 'running',
        metrics: ['accuracy', 'taskCompletion'],
        createdAt: '2024-11-03T00:00:00Z',
        startedAt: '2024-11-03T12:00:00Z',
        progress: 65,
      },
    ];
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, mockCampaigns);
  }

  if (getFromStorage(STORAGE_KEYS.DATASETS).length === 0) {
    const mockDatasets = [
      {
        id: 'ds_001',
        name: 'Customer Support Q&A - Oct 2024',
        description: 'Common customer support questions and expected answers',
        type: 'qa',
        tags: ['support', 'order', 'refund'],
        itemCount: 150,
        version: '1.2',
        createdAt: '2024-10-01T00:00:00Z',
        updatedAt: '2024-10-15T00:00:00Z',
        items: [],
      },
      {
        id: 'ds_002',
        name: 'Product FAQ Dataset',
        description: 'Product specifications and pricing questions',
        type: 'qa',
        tags: ['product', 'specs', 'pricing'],
        itemCount: 300,
        version: '1.0',
        createdAt: '2024-09-01T00:00:00Z',
        updatedAt: '2024-09-01T00:00:00Z',
        items: [],
      },
      {
        id: 'ds_003',
        name: 'Edge Cases & Error Handling',
        description: 'Difficult scenarios and error conditions',
        type: 'conversation',
        tags: ['edge_case', 'error', 'stress_test'],
        itemCount: 50,
        version: '1.0',
        createdAt: '2024-10-20T00:00:00Z',
        updatedAt: '2024-10-20T00:00:00Z',
        items: [],
      },
    ];
    saveToStorage(STORAGE_KEYS.DATASETS, mockDatasets);
  }
}
