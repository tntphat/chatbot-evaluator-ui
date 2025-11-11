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
  evaluationMode?: 'semantic' | 'criteria';
  metricThresholds?: Record<string, number>;
  overallThreshold?: number;
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
  evaluationCriteria?: EvaluationCriterion[]; // NEW: Detailed criteria setup
  targetChatbot?: string; // NEW: Target chatbot for this test suite
}

export interface TestItem {
  id: string;
  type: 'qa' | 'conversation';
  question?: string;
  expectedAnswer?: string;
  keyPoints?: string[]; // NEW: Key points that should be covered
  referenceDoc?: string; // NEW: Reference document link
  conversation?: ConversationTurn[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'high' | 'medium' | 'low'; // NEW: Question priority
  tags?: string[]; // NEW: Flexible tagging
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
  datasetId?: string;
  userMessage: string;
  botResponse: string;
  expectedAnswer?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
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
  // NEW: Detailed ratings per criterion
  accuracy?: number; // 1-5
  completeness?: number; // 1-5
  relevance?: number; // 1-5
  clarity?: number; // 1-5
  tone?: number; // 1-5
  citations?: number; // 1-5
  issues: string[];
  issueFlags?: IssueFlag[]; // NEW: Structured issue flagging
  comments: string;
  reviewedBy: string;
  reviewedAt: string;
  quickRating?: 'like' | 'dislike'; // NEW: Quick thumbs up/down
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

// NEW: Evaluation Criterion with detailed rubric (Process #1)
export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1 (e.g., 0.30 for 30%)
  scale: '0-1' | '1-5' | '1-10' | 'pass-fail';
  rubric: RubricLevel[];
  enabled: boolean;
}

export interface RubricLevel {
  level: number;
  label: string; // e.g., "Excellent", "Good", "Average", "Poor", "Very Poor"
  description: string; // Detailed description for this level
}

// NEW: Issue Flag (Process #2)
export interface IssueFlag {
  type: IssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
}

export type IssueType =
  | 'factual_error'
  | 'incomplete_answer'
  | 'irrelevant_info'
  | 'poor_tone'
  | 'missing_citation'
  | 'too_verbose'
  | 'too_brief'
  | 'confusing'
  | 'hallucination'
  | 'other';

// NEW: Automated Evaluation Config (Process #3)
export interface AutoEvalConfig {
  id: string;
  testSuiteId: string;
  chatbotId: string;
  evaluatorModel: 'gpt-4' | 'claude-3.5' | 'gpt-3.5' | 'embedding';
  evaluationMethod: 'criteria-based' | 'semantic-similarity' | 'hybrid';
  passThreshold: number; // Overall score threshold
  criteriaMinimums?: Record<string, number>; // Per-criterion minimums
  batchSize?: number;
  maxRetries?: number;
}

// NEW: Automated Evaluation Result (Process #3)
export interface AutoEvalResult {
  id: string;
  jobId: string;
  config: AutoEvalConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  duration?: number; // seconds
  totalQuestions: number;
  completedQuestions: number;
  failedQuestions: number;
  passedQuestions: number;
  overallScore: number;
  scoresByCriterion: Record<string, number>;
  passRate: number;
  estimatedCost?: number;
  actualCost?: number;
  detailedResults: QuestionEvalResult[];
}

export interface QuestionEvalResult {
  questionId: string;
  question: string;
  chatbotResponse: string;
  expectedAnswer?: string;
  overallScore: number;
  passed: boolean;
  scoresByCriterion: Record<string, CriterionScore>;
  evaluatorAssessment: string; // LLM's overall assessment
  suggestions: string; // LLM's suggestions for improvement
  metadata: {
    chatbotResponseTime: number;
    evaluatorResponseTime: number;
    tokensUsed: number;
  };
}

export interface CriterionScore {
  score: number;
  weight: number;
  reasoning: string; // LLM's reasoning for this score
}

// NEW: Evaluation History (Process #4)
export interface EvaluationHistory {
  id: string;
  chatbotId: string;
  chatbotVersion: string;
  testSuiteId: string;
  evaluationType: 'manual' | 'automated';
  overallScore: number;
  scoresByCriterion: Record<string, number>;
  passRate: number;
  timestamp: string;
  evaluatorModel?: string; // For automated evals
  evaluatedBy?: string; // For manual evals
}

// NEW: Comparison Result (Process #4)
export interface ComparisonResult {
  id: string;
  name: string;
  versionA: EvaluationHistory;
  versionB: EvaluationHistory;
  improvements: ComparisonItem[];
  regressions: ComparisonItem[];
  unchanged: number;
  recommendation: string;
  createdAt: string;
}

export interface ComparisonItem {
  criterion: string;
  scoreA: number;
  scoreB: number;
  change: number; // Difference
  significance: 'major' | 'moderate' | 'minor';
}
