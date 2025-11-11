import { EvaluationCriterion } from './types';

// Default Evaluation Criteria (6 recommended criteria from BP)
export const DEFAULT_EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'accuracy',
    name: 'Accuracy (Độ chính xác)',
    description: 'Thông tin trong câu trả lời có chính xác không?',
    weight: 0.3,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description: 'Thông tin hoàn toàn sai hoặc không liên quan',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Một số thông tin đúng nhưng có lỗi quan trọng',
      },
      {
        level: 3,
        label: 'Trung bình',
        description:
          'Thông tin cơ bản đúng nhưng thiếu chi tiết hoặc có lỗi nhỏ',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Thông tin chính xác và đầy đủ',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description: 'Thông tin chính xác, đầy đủ, và có thêm context hữu ích',
      },
    ],
  },
  {
    id: 'completeness',
    name: 'Completeness (Tính đầy đủ)',
    description: 'Câu trả lời có cover tất cả key points cần thiết không?',
    weight: 0.25,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description: 'Không trả lời được câu hỏi, thiếu hầu hết thông tin',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Chỉ cover < 50% key points',
      },
      {
        level: 3,
        label: 'Trung bình',
        description: 'Cover 50-70% key points',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Cover 70-90% key points',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description:
          'Cover 100% key points và có thêm thông tin bổ sung hữu ích',
      },
    ],
  },
  {
    id: 'relevance',
    name: 'Relevance (Tính liên quan)',
    description: 'Câu trả lời có liên quan trực tiếp đến câu hỏi không?',
    weight: 0.15,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description: 'Câu trả lời không liên quan đến câu hỏi',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Có một số thông tin liên quan nhưng chủ yếu là off-topic',
      },
      {
        level: 3,
        label: 'Trung bình',
        description: 'Liên quan nhưng có phần dài dòng hoặc thừa thông tin',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Trả lời đúng trọng tâm, ít thông tin thừa',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description: 'Trả lời chính xác vào điểm, không thừa thiếu',
      },
    ],
  },
  {
    id: 'clarity',
    name: 'Clarity (Tính rõ ràng)',
    description: 'Câu trả lời có dễ hiểu, ngôn ngữ rõ ràng không?',
    weight: 0.15,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description: 'Rất khó hiểu, ngôn ngữ confusing',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Có thể hiểu nhưng phải đọc nhiều lần',
      },
      {
        level: 3,
        label: 'Trung bình',
        description: 'Rõ ràng ở mức chấp nhận được',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Dễ hiểu, ngôn ngữ clear và professional',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description: 'Cực kỳ rõ ràng, ngôn ngữ professional và friendly',
      },
    ],
  },
  {
    id: 'tone',
    name: 'Tone & Style (Giọng điệu)',
    description: 'Giọng điệu có phù hợp với brand và context không?',
    weight: 0.1,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description:
          'Giọng điệu không phù hợp (quá formal hoặc quá casual, rude)',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Giọng điệu có vấn đề nhỏ',
      },
      {
        level: 3,
        label: 'Trung bình',
        description: 'Giọng điệu acceptable',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Giọng điệu professional và friendly',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description: 'Giọng điệu hoàn hảo, empathetic và helpful',
      },
    ],
  },
  {
    id: 'citations',
    name: 'Citations & Transparency (Trích dẫn)',
    description: 'Có trích dẫn nguồn hoặc reference khi cần thiết không?',
    weight: 0.05,
    scale: '0-1',
    enabled: true,
    rubric: [
      {
        level: 1,
        label: 'Yếu',
        description: 'Không có citation khi cần, hoặc citation sai',
      },
      {
        level: 2,
        label: 'Kém',
        description: 'Citation thiếu hoặc không đủ clear',
      },
      {
        level: 3,
        label: 'Trung bình',
        description: 'Có citation cơ bản',
      },
      {
        level: 4,
        label: 'Tốt',
        description: 'Citation đầy đủ và chính xác',
      },
      {
        level: 5,
        label: 'Xuất sắc',
        description: 'Citation chi tiết, dễ verify, và có thêm links hữu ích',
      },
    ],
  },
];

// Validate total weight = 1.0
export const validateCriteriaWeights = (
  criteria: EvaluationCriterion[]
): boolean => {
  const totalWeight = criteria
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.weight, 0);
  return Math.abs(totalWeight - 1.0) < 0.01; // Allow small floating point errors
};

// Calculate weighted overall score
export const calculateOverallScore = (
  scores: Record<string, number>,
  criteria: EvaluationCriterion[]
): number => {
  let totalScore = 0;
  criteria
    .filter((c) => c.enabled)
    .forEach((criterion) => {
      const score = scores[criterion.id] || 0;
      totalScore += score * criterion.weight;
    });
  return Math.round(totalScore * 10) / 10; // Round to 1 decimal
};

// Issue type labels (Process #2)
export const ISSUE_TYPE_LABELS: Record<string, string> = {
  factual_error: 'Factual Error',
  incomplete_answer: 'Incomplete Answer',
  irrelevant_info: 'Irrelevant Information',
  poor_tone: 'Poor Tone/Style',
  missing_citation: 'Missing Citation',
  too_verbose: 'Too Verbose',
  too_brief: 'Too Brief',
  confusing: 'Confusing Structure',
  hallucination: 'Hallucination',
  other: 'Other',
};

// Evaluator model info (Process #3)
export const EVALUATOR_MODELS = {
  'gpt-4': {
    name: 'GPT-4 (OpenAI)',
    costPerQuestion: 0.075,
    description: 'Best for comprehensive evaluation',
    pros: ['Excellent reasoning', 'Widely tested', 'Reliable'],
    estimatedTime: '5-8 mins per 100 questions',
  },
  'claude-3.5': {
    name: 'Claude 3.5 Sonnet (Anthropic)',
    costPerQuestion: 0.08,
    description: 'Best for detailed reasoning',
    pros: ['Strong analysis', 'Long context', 'Detailed explanations'],
    estimatedTime: '6-10 mins per 100 questions',
  },
  'gpt-3.5': {
    name: 'GPT-3.5-turbo (OpenAI)',
    costPerQuestion: 0.001,
    description: 'Budget option for quick tests',
    pros: ['Fast', 'Cheap', 'Good for smoke tests'],
    estimatedTime: '3-5 mins per 100 questions',
  },
  embedding: {
    name: 'Embedding-based (Semantic Similarity)',
    costPerQuestion: 0.0004,
    description: 'Fast factual checks',
    pros: ['Very fast', 'Very cheap', 'Deterministic'],
    estimatedTime: '1-2 mins per 100 questions',
  },
};
