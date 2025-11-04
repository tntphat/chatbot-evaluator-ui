// Core Types for Chatbot Evaluator

export interface Chatbot {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  chatbotIds: string[];
  evaluationType: ('automated' | 'human' | 'both')[];
  datasetId?: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  metrics: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  results?: CampaignResults;
}

export interface CampaignResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  avgAccuracy: number;
  avgResponseTime: number;
  avgQualityScore: number;
  taskCompletionRate: number;
  errorRate: number;
}

export interface TestDataset {
  id: string;
  name: string;
  description: string;
  type: 'conversation' | 'qa' | 'custom';
  tags: string[];
  itemCount: number;
  version: string;
  createdAt: string;
  updatedAt: string;
  items: TestItem[];
}

export interface TestItem {
  id: string;
  type: 'qa' | 'conversation';
  question?: string;
  expectedAnswer?: string;
  conversation?: ConversationTurn[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ConversationTurn {
  speaker: 'user' | 'bot';
  message: string;
  expectedIntent?: string;
  expectedActions?: string[];
}

export interface EvaluationItem {
  id: string;
  campaignId: string;
  chatbotId: string;
  testItemId: string;
  userMessage: string;
  botResponse: string;
  responseTime: number;
  metrics: {
    accuracy: number;
    bleuScore?: number;
    bertScore?: number;
    toxicity?: number;
    hallucination: boolean;
  };
  humanRating?: HumanRating;
  passed: boolean;
  issues: string[];
  status: 'pending' | 'in_review' | 'completed';
  createdAt: string;
}

export interface HumanRating {
  overallQuality: number; // 1-5
  coherence: number; // 1-5
  helpfulness: number; // 1-5
  fluency: number; // 1-5
  empathy: number; // 1-5
  issues: string[];
  comments: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface MetricConfig {
  id: string;
  name: string;
  category: 'automated' | 'human' | 'business';
  enabled: boolean;
  threshold?: number;
}

export interface ABTest {
  id: string;
  name: string;
  variantA: string; // chatbot ID
  variantB: string; // chatbot ID
  trafficSplitA: number;
  trafficSplitB: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  primaryMetric: string;
  results?: ABTestResults;
}

export interface ABTestResults {
  variantA: ABVariantResults;
  variantB: ABVariantResults;
  winner: 'A' | 'B' | null;
  confidenceLevel: number;
}

export interface ABVariantResults {
  conversationsCount: number;
  uniqueUsers: number;
  taskCompletionRate: number;
  userSatisfaction: number;
  responseTime: number;
  errorRate: number;
}
