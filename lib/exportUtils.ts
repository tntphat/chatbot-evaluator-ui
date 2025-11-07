// Export utilities for generating reports

import type { Campaign, TestDataset, HumanRating } from './types';
import type { AutoEvaluationResult } from './mockLLMEvaluator';

/**
 * Export campaign report as JSON
 */
export function exportCampaignAsJSON(campaign: Campaign): void {
  const data = {
    exportDate: new Date().toISOString(),
    exportType: 'campaign_report',
    campaign: {
      ...campaign,
      exportedAt: new Date().toISOString(),
    },
  };

  downloadJSON(data, `campaign_${campaign.id}_${Date.now()}.json`);
}

/**
 * Export campaign report as text summary
 */
export function exportCampaignAsText(campaign: Campaign): void {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('              CAMPAIGN EVALUATION REPORT');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Campaign: ${campaign.name}`);
  lines.push(`Description: ${campaign.description || 'N/A'}`);
  lines.push(`Status: ${campaign.status.toUpperCase()}`);
  lines.push(`Created: ${new Date(campaign.createdAt).toLocaleString()}`);
  lines.push(`Progress: ${campaign.progress}%`);
  lines.push('');

  if (campaign.results) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('RESULTS SUMMARY');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(`Total Tests:          ${campaign.results.totalTests}`);
    lines.push(`Passed Tests:         ${campaign.results.passedTests}`);
    lines.push(`Failed Tests:         ${campaign.results.failedTests}`);
    lines.push(`Pass Rate:            ${campaign.results.passRate}%`);
    lines.push(`Avg Accuracy:         ${campaign.results.avgAccuracy}%`);
    lines.push(`Avg Quality Score:    ${campaign.results.avgQualityScore}/5`);
    lines.push(`Task Completion Rate: ${campaign.results.taskCompletionRate}%`);
    lines.push(`Error Rate:           ${campaign.results.errorRate}%`);
    lines.push(`Avg Response Time:    ${campaign.results.avgResponseTime}ms`);
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────────────────');
  lines.push('EVALUATION METRICS');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('');
  campaign.metrics.forEach((metric, idx) => {
    lines.push(`${idx + 1}. ${metric}`);
  });
  lines.push('');

  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`Report Generated: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════════════════');

  const text = lines.join('\n');
  downloadText(text, `campaign_${campaign.id}_report_${Date.now()}.txt`);
}

/**
 * Export evaluation results as CSV
 */
export function exportEvaluationsAsCSV(
  evaluations: AutoEvaluationResult[],
  metadata?: { campaignName?: string; datasetName?: string }
): void {
  const headers = [
    'Index',
    'Overall Score',
    'Accuracy',
    'Relevance',
    'Coherence',
    'Completeness',
    'Toxicity',
    'Hallucination',
    'Issues',
    'Passed',
  ];

  const rows = evaluations.map((eval, idx) => [
    (idx + 1).toString(),
    eval.overallScore.toString(),
    eval.accuracyScore?.toString() || 'N/A',
    eval.relevanceScore?.toString() || 'N/A',
    eval.coherenceScore?.toString() || 'N/A',
    eval.completenessScore?.toString() || 'N/A',
    eval.toxicityScore?.toString() || 'N/A',
    eval.hallucinationDetected ? 'Yes' : 'No',
    eval.issues.length > 0 ? eval.issues.join('; ') : 'None',
    eval.passedEvaluation ? 'PASS' : 'FAIL',
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
  });

  // Add metadata as comments at the top
  if (metadata) {
    const metaLines: string[] = [];
    if (metadata.campaignName) {
      metaLines.push(`# Campaign: ${metadata.campaignName}`);
    }
    if (metadata.datasetName) {
      metaLines.push(`# Dataset: ${metadata.datasetName}`);
    }
    metaLines.push(`# Generated: ${new Date().toISOString()}`);
    metaLines.push('');
    csv = metaLines.join('\n') + csv;
  }

  downloadText(csv, `evaluation_results_${Date.now()}.csv`);
}

/**
 * Export dataset as JSON
 */
export function exportDatasetAsJSON(dataset: TestDataset): void {
  const data = {
    exportDate: new Date().toISOString(),
    exportType: 'dataset',
    dataset,
  };

  downloadJSON(data, `dataset_${dataset.id}_${Date.now()}.json`);
}

/**
 * Export dataset items as text (Q&A format)
 */
export function exportDatasetAsText(dataset: TestDataset): void {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push(`              ${dataset.name.toUpperCase()}`);
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Description: ${dataset.description}`);
  lines.push(`Type: ${dataset.type.toUpperCase()}`);
  lines.push(`Version: ${dataset.version}`);
  lines.push(`Total Items: ${dataset.itemCount}`);
  lines.push(`Created: ${new Date(dataset.createdAt).toLocaleDateString()}`);
  lines.push('');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('TEST ITEMS');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push('');

  if (dataset.items && dataset.items.length > 0) {
    dataset.items.forEach((item, idx) => {
      lines.push(
        `[${idx + 1}] ${item.difficulty?.toUpperCase() || 'MEDIUM'} - ${
          item.category || 'General'
        }`
      );
      lines.push('');
      lines.push(`Q: ${item.question || 'N/A'}`);
      lines.push('');
      lines.push(`A: ${item.expectedAnswer || 'N/A'}`);
      lines.push('');
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('');
    });
  } else {
    lines.push('(No items in this dataset)');
    lines.push('');
  }

  lines.push(`Exported: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════════════════');

  const text = lines.join('\n');
  downloadText(
    text,
    `dataset_${dataset.name.replace(/\s/g, '_')}_${Date.now()}.txt`
  );
}

/**
 * Export human evaluation ratings as JSON
 */
export function exportHumanRatingsAsJSON(
  ratings: Array<{
    conversationId: string;
    rating: HumanRating;
    quickRating?: 'like' | 'dislike';
  }>
): void {
  const data = {
    exportDate: new Date().toISOString(),
    exportType: 'human_ratings',
    totalRatings: ratings.length,
    ratings,
  };

  downloadJSON(data, `human_ratings_${Date.now()}.json`);
}

/**
 * Export comprehensive evaluation report (includes everything)
 */
export function exportComprehensiveReport(data: {
  campaign?: Campaign;
  dataset?: TestDataset;
  autoEvaluations?: AutoEvaluationResult[];
  humanRatings?: any[];
}): void {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('       COMPREHENSIVE CHATBOT EVALUATION REPORT');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  if (data.campaign) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('1. CAMPAIGN INFORMATION');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(`Name: ${data.campaign.name}`);
    lines.push(`Status: ${data.campaign.status}`);
    lines.push(`Progress: ${data.campaign.progress}%`);
    if (data.campaign.results) {
      lines.push('');
      lines.push('Results:');
      lines.push(`  - Pass Rate: ${data.campaign.results.passRate}%`);
      lines.push(`  - Avg Quality: ${data.campaign.results.avgQualityScore}/5`);
      lines.push(`  - Avg Accuracy: ${data.campaign.results.avgAccuracy}%`);
    }
    lines.push('');
  }

  if (data.dataset) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('2. DATASET INFORMATION');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(`Name: ${data.dataset.name}`);
    lines.push(`Type: ${data.dataset.type}`);
    lines.push(`Items: ${data.dataset.itemCount}`);
    lines.push('');
  }

  if (data.autoEvaluations && data.autoEvaluations.length > 0) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('3. AUTOMATIC EVALUATION RESULTS');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    const passed = data.autoEvaluations.filter(
      (e) => e.passedEvaluation
    ).length;
    const avgScore =
      data.autoEvaluations.reduce((sum, e) => sum + e.overallScore, 0) /
      data.autoEvaluations.length;
    lines.push(`Total Evaluations: ${data.autoEvaluations.length}`);
    lines.push(`Passed: ${passed}`);
    lines.push(`Failed: ${data.autoEvaluations.length - passed}`);
    lines.push(
      `Pass Rate: ${((passed / data.autoEvaluations.length) * 100).toFixed(1)}%`
    );
    lines.push(`Average Score: ${avgScore.toFixed(1)}/100`);
    lines.push('');
  }

  if (data.humanRatings && data.humanRatings.length > 0) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('4. HUMAN EVALUATION SUMMARY');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(`Total Ratings: ${data.humanRatings.length}`);
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('                   END OF REPORT');
  lines.push('═══════════════════════════════════════════════════════════');

  const text = lines.join('\n');
  downloadText(text, `comprehensive_report_${Date.now()}.txt`);
}

// Helper functions

function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}







