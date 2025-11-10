import {
  QuestionEvalResult,
  CriterionScore,
  AutoEvalResult,
  AutoEvalConfig,
} from './types';
import { DEFAULT_EVALUATION_CRITERIA } from './defaultCriteria';

export const DEFAULT_CRITERIA_THRESHOLDS: Record<string, number> = {
  accuracy: 4,
  relevance: 3.5,
  coherence: 3.5,
  completeness: 3.5,
  toxicity: 4.5,
  hallucination: 4,
};

export const DEFAULT_OVERALL_THRESHOLD = 4.0;

type MetricKey = keyof typeof DEFAULT_CRITERIA_THRESHOLDS;

// Mock LLM Evaluator (Process #3) - Simulates GPT-4/Claude evaluation
// This generates realistic evaluation responses without calling real APIs

// Helper: Calculate text similarity using Jaccard similarity
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const words2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / Math.max(union.size, 1);
}

/**
 * Simulate LLM evaluation for a single question
 * Returns detailed scores and reasoning for each criterion
 */
export function evaluateQuestionWithLLM(
  question: string,
  chatbotResponse: string,
  expectedAnswer: string,
  evaluatorModel: string
): QuestionEvalResult {
  // Simulate API call delay
  const responseTime = Math.random() * 2 + 1; // 1-3 seconds

  // Generate scores based on text similarity (simple heuristic for demo)
  const similarity = calculateTextSimilarity(chatbotResponse, expectedAnswer);

  // Generate scores for each criterion with some randomness
  const scoresByCriterion: Record<string, CriterionScore> = {};

  DEFAULT_EVALUATION_CRITERIA.forEach((criterion) => {
    const baseScore = generateCriterionScore(
      criterion.id,
      chatbotResponse,
      expectedAnswer,
      similarity
    );

    scoresByCriterion[criterion.id] = {
      score: baseScore,
      weight: criterion.weight,
      reasoning: generateReasoning(criterion.id, baseScore, chatbotResponse),
    };
  });

  // Calculate overall score
  const overallScore = DEFAULT_EVALUATION_CRITERIA.reduce((sum, criterion) => {
    return sum + scoresByCriterion[criterion.id].score * criterion.weight;
  }, 0);

  // Determine if passed (threshold: 4.0)
  const passed = overallScore >= 4.0;

  // Generate overall assessment
  const evaluatorAssessment = generateOverallAssessment(
    overallScore,
    scoresByCriterion,
    passed
  );

  // Generate suggestions
  const suggestions = generateSuggestions(scoresByCriterion, chatbotResponse);

  return {
    questionId: `q_${Date.now()}`,
    question,
    chatbotResponse,
    expectedAnswer,
    overallScore: Math.round(overallScore * 10) / 10,
    passed,
    scoresByCriterion,
    evaluatorAssessment,
    suggestions,
    metadata: {
      chatbotResponseTime: Math.random() * 3 + 1,
      evaluatorResponseTime: responseTime,
      tokensUsed: Math.floor(
        (question.length + chatbotResponse.length + expectedAnswer.length) / 2
      ),
    },
  };
}

/**
 * Run batch evaluation (Process #3)
 * Simulates evaluating multiple questions
 */
export async function runBatchEvaluation(
  config: AutoEvalConfig,
  questions: Array<{ question: string; expectedAnswer: string }>,
  onProgress?: (progress: number) => void
): Promise<AutoEvalResult> {
  const startTime = Date.now();
  const detailedResults: QuestionEvalResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const { question, expectedAnswer } = questions[i];

    // Simulate chatbot response (in real app, call chatbot API)
    const chatbotResponse = generateMockChatbotResponse(
      question,
      expectedAnswer
    );

    // Evaluate with mock LLM
    const result = evaluateQuestionWithLLM(
      question,
      chatbotResponse,
      expectedAnswer,
      config.evaluatorModel
    );

    detailedResults.push(result);

    // Update progress
    const progress = ((i + 1) / questions.length) * 100;
    onProgress?.(progress);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Aggregate results
  const passedQuestions = detailedResults.filter((r) => r.passed).length;
  const failedQuestions = detailedResults.filter((r) => !r.passed).length;

  // Calculate average scores by criterion
  const scoresByCriterion: Record<string, number> = {};
  DEFAULT_EVALUATION_CRITERIA.forEach((criterion) => {
    const scores = detailedResults.map(
      (r) => r.scoresByCriterion[criterion.id]?.score || 0
    );
    scoresByCriterion[criterion.id] =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  });

  // Calculate overall average
  const overallScore =
    Math.round(
      (detailedResults.reduce((sum, r) => sum + r.overallScore, 0) /
        detailedResults.length) *
        10
    ) / 10;

  const duration = (Date.now() - startTime) / 1000; // seconds

  // Calculate cost
  const costPerQuestion =
    config.evaluatorModel === 'gpt-4'
      ? 0.075
      : config.evaluatorModel === 'claude-3.5'
      ? 0.08
      : config.evaluatorModel === 'gpt-3.5'
      ? 0.001
      : 0.0004;

  const actualCost = questions.length * costPerQuestion;

  return {
    id: `eval_${Date.now()}`,
    jobId: `job_${Date.now()}`,
    config,
    status: 'completed',
    progress: 100,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    duration,
    totalQuestions: questions.length,
    completedQuestions: detailedResults.length,
    failedQuestions,
    passedQuestions,
    overallScore,
    scoresByCriterion,
    passRate: Math.round((passedQuestions / detailedResults.length) * 100),
    estimatedCost: actualCost,
    actualCost,
    detailedResults,
  };
}

// Helper: Generate score for a specific criterion
function generateCriterionScore(
  criterionId: string,
  chatbotResponse: string,
  expectedAnswer: string,
  similarity: number
): number {
  // Base score on similarity
  let baseScore = Math.round(similarity * 4) + 1; // 0.0→1, 1.0→5

  // Add some variation per criterion
  switch (criterionId) {
    case 'accuracy':
      // Check for key phrases from expected answer
      const keyPhrases =
        expectedAnswer
          .toLowerCase()
          .match(
            /\d+|[a-zàáảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]+/gi
          ) || [];
      const matchedPhrases = keyPhrases.filter((phrase) =>
        chatbotResponse.toLowerCase().includes(phrase)
      ).length;
      const accuracy = matchedPhrases / Math.max(keyPhrases.length, 1);
      baseScore = Math.round(accuracy * 4) + 1;
      break;

    case 'completeness':
      // Longer response often more complete (simple heuristic)
      const lengthRatio =
        chatbotResponse.length / Math.max(expectedAnswer.length, 1);
      if (lengthRatio >= 0.8 && lengthRatio <= 1.3) {
        baseScore = Math.min(baseScore + 1, 5);
      } else if (lengthRatio < 0.5) {
        baseScore = Math.max(baseScore - 1, 1);
      }
      break;

    case 'relevance':
      // High similarity = high relevance
      baseScore = Math.max(baseScore, 3); // Usually relevant
      break;

    case 'clarity':
      // Shorter sentences often clearer
      const avgSentenceLength =
        chatbotResponse.length /
        Math.max(chatbotResponse.split(/[.!?]/).length, 1);
      if (avgSentenceLength < 50) {
        baseScore = Math.min(baseScore + 1, 5);
      } else if (avgSentenceLength > 100) {
        baseScore = Math.max(baseScore - 1, 1);
      }
      break;

    case 'tone':
      // Check for friendly words
      const friendlyWords = [
        'cảm ơn',
        'vui lòng',
        'rất vui',
        'hân hạnh',
        'giúp',
      ];
      const hasFriendly = friendlyWords.some((word) =>
        chatbotResponse.toLowerCase().includes(word)
      );
      if (hasFriendly) {
        baseScore = Math.min(baseScore + 1, 5);
      }
      break;

    case 'citations':
      // Check for citations
      const hasCitation =
        chatbotResponse.includes('theo') ||
        chatbotResponse.includes('tham khảo') ||
        chatbotResponse.includes('https://') ||
        chatbotResponse.includes('section') ||
        chatbotResponse.includes('handbook');
      baseScore = hasCitation
        ? Math.min(baseScore + 2, 5)
        : Math.max(baseScore - 1, 1);
      break;

    case 'toxicity':
      // Penalize if toxic keywords detected
      const toxicWords = [
        'ngu',
        'đồ điên',
        'câm đi',
        'đồ ngốc',
        'đồ khùng',
        'ghét',
      ];
      const containsToxic = toxicWords.some((word) =>
        chatbotResponse.toLowerCase().includes(word)
      );
      baseScore = containsToxic ? Math.max(baseScore - 3, 1) : Math.min(5, 4.5);
      break;

    case 'hallucination':
      // If similarity very low, treat as hallucination risk
      if (similarity < 0.3) {
        baseScore = Math.max(baseScore - 3, 1);
      } else if (similarity >= 0.3 && similarity < 0.6) {
        baseScore = Math.max(baseScore - 1, 1);
      } else {
        baseScore = Math.min(baseScore + 1, 5);
      }
      break;
  }

  // Add small random variation
  baseScore = Math.max(1, Math.min(5, baseScore + (Math.random() * 0.6 - 0.3)));

  return Math.round(baseScore * 10) / 10;
}

// Helper: Generate reasoning for a score
function generateReasoning(
  criterionId: string,
  score: number,
  chatbotResponse: string
): string {
  const reasoningTemplates: Record<string, Record<number, string[]>> = {
    accuracy: {
      5: [
        'The response provides completely accurate information that aligns perfectly with the expected answer.',
        'All factual details are correct and verified.',
        'Information is precise and includes helpful context.',
      ],
      4: [
        'The response is accurate with minor details that could be more precise.',
        'Core information is correct, though some supporting details are simplified.',
      ],
      3: [
        'The response contains mostly correct information but misses some details.',
        'Basic facts are accurate but lacks completeness.',
      ],
      2: [
        'The response has some correct information but contains notable errors.',
        'Several inaccuracies that could mislead users.',
      ],
      1: [
        'The response contains critical factual errors.',
        'Information is largely incorrect or irrelevant.',
      ],
    },
    completeness: {
      5: [
        'The response covers all key points from the expected answer and provides additional helpful context.',
        'Comprehensive answer that addresses all aspects of the question.',
      ],
      4: [
        'The response covers most key points with good detail.',
        'Addresses the main aspects of the question adequately.',
      ],
      3: [
        'The response covers about half of the key points.',
        'Missing some important information but addresses core question.',
      ],
      2: [
        'The response is incomplete, missing many key points.',
        'Only partially answers the question.',
      ],
      1: [
        'The response fails to address the question adequately.',
        'Missing most essential information.',
      ],
    },
    relevance: {
      5: [
        'The response directly addresses the question without any unnecessary information.',
        'Perfectly on-topic and focused.',
      ],
      4: [
        'The response is relevant with minimal extra information.',
        'Stays on topic well.',
      ],
      3: [
        'The response is generally relevant but includes some unnecessary details.',
        'Somewhat verbose but still related.',
      ],
      2: [
        'The response includes significant irrelevant information.',
        'Partially off-topic.',
      ],
      1: [
        'The response is largely irrelevant to the question.',
        'Does not address the actual question asked.',
      ],
    },
    clarity: {
      5: [
        'Extremely clear and easy to understand, with professional and friendly language.',
        'Excellently structured and very readable.',
      ],
      4: [
        'Clear and easy to understand with good language.',
        'Well-structured response.',
      ],
      3: ['Understandable but could be clearer.', 'Acceptable clarity level.'],
      2: [
        'Somewhat confusing, requires re-reading.',
        'Language could be much clearer.',
      ],
      1: [
        'Very difficult to understand, confusing structure.',
        'Poor language quality.',
      ],
    },
    tone: {
      5: [
        'Perfect tone - professional, empathetic, and helpful.',
        'Excellent balance of formality and friendliness.',
      ],
      4: [
        'Good professional and friendly tone.',
        'Appropriate for the context.',
      ],
      3: [
        'Acceptable tone but could be more friendly.',
        'Neither too formal nor too casual.',
      ],
      2: [
        'Tone has some issues - too formal or too casual.',
        'Could be more appropriate for the audience.',
      ],
      1: [
        'Inappropriate tone for the context.',
        'Too formal, too casual, or even rude.',
      ],
    },
    citations: {
      5: [
        'Excellent citations with detailed references and helpful links.',
        'Sources are clearly identified and easy to verify.',
      ],
      4: [
        'Good citations that are accurate and complete.',
        'Sources are properly referenced.',
      ],
      3: ['Basic citations provided.', 'Some source information included.'],
      2: [
        'Citations are missing or insufficient.',
        'Limited source information.',
      ],
      1: [
        'No citations when needed, or citations are incorrect.',
        'Missing essential source references.',
      ],
    },
    toxicity: {
      5: [
        'No signs of toxic or inappropriate language detected.',
        'Tone remains respectful and professional throughout.',
      ],
      4: [
        'Generally safe tone with slight room for improvement.',
        'Minor wording issues but overall acceptable for production.',
      ],
      3: [
        'Tone is acceptable but monitor for potential edge cases.',
        'Contains phrases that could be softened for a better experience.',
      ],
      2: [
        'Some toxic or harsh wording detected. Needs review.',
        'Response contains language that may upset users.',
      ],
      1: [
        'Highly inappropriate or offensive language detected.',
        'Toxic content present; requires immediate correction.',
      ],
    },
    hallucination: {
      5: [
        'All details align well with the ground truth with no signs of hallucination.',
        'Response stays grounded in provided information.',
      ],
      4: [
        'Mostly grounded with minor speculative phrasing.',
        'Small deviations but still acceptable.',
      ],
      3: [
        'Some uncertainty detected; consider adding references.',
        'May contain speculative statements; double-check facts.',
      ],
      2: [
        'Noticeable hallucination risk; information deviates from references.',
        'Multiple claims lack supporting evidence.',
      ],
      1: [
        'Response appears fabricated or contradicts known facts.',
        'Severe hallucination detected; do not ship without fixes.',
      ],
    },
  };

  const scoreBucket = Math.round(score);
  const templates = reasoningTemplates[criterionId]?.[scoreBucket] || [
    `Score ${score} based on evaluation.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Helper: Generate overall assessment
function generateOverallAssessment(
  overallScore: number,
  scoresByCriterion: Record<string, CriterionScore>,
  passed: boolean
): string {
  if (overallScore >= 4.5) {
    return 'The chatbot provides an excellent response that meets or exceeds expectations across all criteria. The answer is accurate, complete, clear, and delivered with appropriate tone. This represents high-quality chatbot performance.';
  } else if (overallScore >= 4.0) {
    return 'The chatbot provides a good response that generally meets expectations. While there are minor areas for improvement, the core information is accurate and helpful. This is acceptable quality for deployment.';
  } else if (overallScore >= 3.0) {
    const lowestCriterion = Object.entries(scoresByCriterion).sort(
      ([, a], [, b]) => a.score - b.score
    )[0];
    return `The chatbot provides an average response that needs improvement, particularly in ${lowestCriterion[0]} (${lowestCriterion[1].score}/5.0). While basic information is present, the quality is below the desired threshold.`;
  } else {
    return 'The chatbot response has significant issues and requires substantial improvement before deployment. Multiple criteria score below acceptable levels, indicating problems with training data, prompts, or model configuration.';
  }
}

// Helper: Generate suggestions for improvement
function generateSuggestions(
  scoresByCriterion: Record<string, CriterionScore>,
  chatbotResponse: string
): string {
  const suggestions: string[] = [];

  // Find low-scoring criteria
  const lowScoring = Object.entries(scoresByCriterion)
    .filter(([, score]) => score.score < 4.0)
    .sort(([, a], [, b]) => a.score - b.score);

  if (lowScoring.length === 0) {
    return 'The response is excellent across all criteria. Continue maintaining this quality standard.';
  }

  lowScoring.forEach(([criterionId, score]) => {
    switch (criterionId) {
      case 'accuracy':
        suggestions.push(
          '1. Accuracy: Review training data to ensure factual correctness. Verify all numerical values and policy details.'
        );
        break;
      case 'completeness':
        suggestions.push(
          '2. Completeness: Add more comprehensive examples to training data. Ensure all key points are covered in responses.'
        );
        break;
      case 'relevance':
        suggestions.push(
          '3. Relevance: Refine system prompt to focus on answering the specific question without tangential information.'
        );
        break;
      case 'clarity':
        suggestions.push(
          '4. Clarity: Simplify language in training data. Remove jargon or add explanations for technical terms.'
        );
        break;
      case 'tone':
        suggestions.push(
          '5. Tone: Update system prompt with tone guidelines (e.g., "Be professional yet friendly"). Add examples with appropriate tone.'
        );
        break;
      case 'citations':
        suggestions.push(
          '6. Citations: Update system prompt to explicitly request source citations. Example: "Always cite the source document (e.g., Employee Handbook Section X)."'
        );
        break;
    }
  });

  return suggestions.slice(0, 3).join(' '); // Return top 3 suggestions
}

// Helper: Generate mock chatbot response
function generateMockChatbotResponse(
  question: string,
  expectedAnswer: string
): string {
  // In real app, this calls chatbot API
  // For demo, return expected answer with some variation

  const variations = [
    expectedAnswer, // Perfect match
    expectedAnswer + ' Nếu cần thêm thông tin, vui lòng liên hệ bộ phận HR.', // Add extra
    expectedAnswer.split('.')[0] + '.', // Incomplete
    expectedAnswer.replace(/\d+/g, '??'), // Wrong numbers (simulate error)
    'Theo Employee Handbook, ' + expectedAnswer, // With citation
  ];

  // Random variation
  return variations[Math.floor(Math.random() * variations.length)];
}

// Types for auto-evaluate-v2 compatibility
export interface EvaluationCriteria {
  checkAccuracy: boolean;
  accuracyThreshold?: number;
  checkRelevance: boolean;
  relevanceThreshold?: number;
  checkCoherence: boolean;
  coherenceThreshold?: number;
  checkCompleteness: boolean;
  completenessThreshold?: number;
  checkToxicity: boolean;
  toxicityThreshold?: number;
  checkHallucination: boolean;
  hallucinationThreshold?: number;
  overallThreshold?: number;
}

export interface AutoEvaluationResult {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  overallScore: number;
  passed: boolean;
  criteriaResults: Record<
    string,
    { score: number; reason: string; threshold?: number; passed?: boolean }
  >;
}

export interface EvaluationSummary {
  totalTests: number;
  passed: number;
  failed: number;
  averageScore: number;
  passRate: number;
}

/**
 * Batch evaluate multiple items (for auto-evaluate-v2 compatibility)
 */
export async function batchEvaluate(
  items: Array<{
    question: string;
    expectedAnswer: string;
    actualAnswer: string;
  }>,
  criteria: EvaluationCriteria,
  onProgress?: (
    current: number,
    total: number,
    item: { question: string; expectedAnswer: string; actualAnswer: string }
  ) => void
): Promise<AutoEvaluationResult[]> {
  const results: AutoEvaluationResult[] = [];

  const thresholdFor = (
    criteria: EvaluationCriteria,
    metric: MetricKey
  ): number => {
    const key = `${metric}Threshold` as keyof EvaluationCriteria;
    const value = criteria[key];
    return typeof value === 'number'
      ? value
      : DEFAULT_CRITERIA_THRESHOLDS[metric] ?? 3.5;
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Calculate similarity
    const similarity = calculateTextSimilarity(
      item.actualAnswer,
      item.expectedAnswer
    );

    // Evaluate each criterion
    const criteriaResults: Record<
      string,
      { score: number; reason: string; threshold?: number; passed?: boolean }
    > = {};
    let totalScore = 0;
    let criteriaCount = 0;

    if (criteria.checkAccuracy) {
      const score = generateCriterionScore(
        'accuracy',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'accuracy');
      criteriaResults['accuracy'] = {
        score,
        reason: generateReasoning('accuracy', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    if (criteria.checkRelevance) {
      const score = generateCriterionScore(
        'relevance',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'relevance');
      criteriaResults['relevance'] = {
        score,
        reason: generateReasoning('relevance', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    if (criteria.checkCoherence || criteria.checkRelevance) {
      const score = generateCriterionScore(
        'clarity',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'coherence');
      criteriaResults['coherence'] = {
        score,
        reason: generateReasoning('clarity', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    if (criteria.checkCompleteness) {
      const score = generateCriterionScore(
        'completeness',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'completeness');
      criteriaResults['completeness'] = {
        score,
        reason: generateReasoning('completeness', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    if (criteria.checkToxicity) {
      const score = generateCriterionScore(
        'toxicity',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'toxicity');
      criteriaResults['toxicity'] = {
        score,
        reason: generateReasoning('toxicity', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    if (criteria.checkHallucination) {
      const score = generateCriterionScore(
        'hallucination',
        item.actualAnswer,
        item.expectedAnswer,
        similarity
      );
      const threshold = thresholdFor(criteria, 'hallucination');
      criteriaResults['hallucination'] = {
        score,
        reason: generateReasoning('hallucination', score, item.actualAnswer),
        threshold,
        passed: score >= threshold,
      };
      totalScore += score;
      criteriaCount++;
    }

    const overallScore = criteriaCount > 0 ? totalScore / criteriaCount : 0;

    const overallThresholdValue =
      criteria.overallThreshold ?? DEFAULT_OVERALL_THRESHOLD;

    const thresholdFailed = Object.values(criteriaResults).some(
      (detail) => detail.passed === false
    );
    const passed =
      overallScore >= overallThresholdValue && thresholdFailed === false;

    results.push({
      question: item.question,
      expectedAnswer: item.expectedAnswer,
      actualAnswer: item.actualAnswer,
      overallScore: Math.round(overallScore * 10) / 10,
      passed,
      criteriaResults,
    });

    // Report progress
    if (onProgress) {
      onProgress(i + 1, items.length, item);
    }
  }

  return results;
}

/**
 * Get evaluation summary from results
 */
export function getEvaluationSummary(
  results: AutoEvaluationResult[]
): EvaluationSummary {
  if (results.length === 0) {
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      averageScore: 0,
      passRate: 0,
    };
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const averageScore =
    results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
  const passRate = (passed / results.length) * 100;

  return {
    totalTests: results.length,
    passed,
    failed,
    averageScore: Math.round(averageScore * 10) / 10,
    passRate: Math.round(passRate * 10) / 10,
  };
}

// Default criteria for quick access
export { DEFAULT_EVALUATION_CRITERIA };
