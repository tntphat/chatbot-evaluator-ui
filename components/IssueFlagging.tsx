'use client';

import { useState } from 'react';
import { Card } from './ui/Card';
import { IssueFlag, IssueType } from '@/lib/types';
import { ISSUE_TYPE_LABELS } from '@/lib/defaultCriteria';

interface IssueFlaggingProps {
  selectedIssues: IssueFlag[];
  onChange: (issues: IssueFlag[]) => void;
}

const ISSUE_DEFINITIONS: Record<
  IssueType,
  { label: string; description: string; severity: IssueFlag['severity'] }
> = {
  factual_error: {
    label: 'Factual Error',
    description: 'Thông tin không chính xác',
    severity: 'critical',
  },
  incomplete_answer: {
    label: 'Incomplete Answer',
    description: 'Thiếu thông tin quan trọng',
    severity: 'high',
  },
  irrelevant_info: {
    label: 'Irrelevant Information',
    description: 'Thông tin không liên quan',
    severity: 'medium',
  },
  poor_tone: {
    label: 'Poor Tone/Style',
    description: 'Giọng điệu không phù hợp',
    severity: 'medium',
  },
  missing_citation: {
    label: 'Missing Citation',
    description: 'Thiếu trích dẫn khi cần',
    severity: 'high',
  },
  too_verbose: {
    label: 'Too Verbose',
    description: 'Quá dài dòng',
    severity: 'low',
  },
  too_brief: {
    label: 'Too Brief',
    description: 'Quá ngắn gọn',
    severity: 'low',
  },
  confusing: {
    label: 'Confusing Structure',
    description: 'Cấu trúc khó hiểu',
    severity: 'medium',
  },
  hallucination: {
    label: 'Hallucination',
    description: 'Thông tin bịa đặt, không có trong training data',
    severity: 'critical',
  },
  other: {
    label: 'Other',
    description: 'Vấn đề khác',
    severity: 'medium',
  },
};

export function IssueFlagging({
  selectedIssues,
  onChange,
}: IssueFlaggingProps) {
  const [expanded, setExpanded] = useState(false);
  const [otherDescription, setOtherDescription] = useState('');

  const toggleIssue = (type: IssueType) => {
    const exists = selectedIssues.find((i) => i.type === type);
    if (exists) {
      onChange(selectedIssues.filter((i) => i.type !== type));
    } else {
      const newIssue: IssueFlag = {
        type,
        severity: ISSUE_DEFINITIONS[type].severity,
        description: type === 'other' ? otherDescription : undefined,
      };
      onChange([...selectedIssues, newIssue]);
    }
  };

  const isSelected = (type: IssueType) =>
    selectedIssues.some((i) => i.type === type);

  const getSeverityColor = (severity: IssueFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: IssueFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
    }
  };

  return (
    <Card>
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h4 className='text-md font-semibold text-gray-900 flex items-center gap-2'>
              🚩 Flag Issues
              {selectedIssues.length > 0 && (
                <span className='text-sm text-red-600 font-normal'>
                  ({selectedIssues.length} selected)
                </span>
              )}
            </h4>
            <p className='text-sm text-gray-600'>
              Select all issues that apply (optional)
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className='text-sm text-blue-600 hover:text-blue-700'
          >
            {expanded ? '⊟ Collapse' : '⊞ Expand'}
          </button>
        </div>

        {/* Issue Grid */}
        {expanded && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {(Object.keys(ISSUE_DEFINITIONS) as IssueType[]).map((type) => {
              const issue = ISSUE_DEFINITIONS[type];
              const selected = isSelected(type);

              return (
                <div key={type}>
                  <label
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selected
                        ? `${getSeverityColor(issue.severity)} border-2`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      checked={selected}
                      onChange={() => toggleIssue(type)}
                      className='mt-0.5 w-5 h-5'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm'>
                          {getSeverityIcon(issue.severity)}
                        </span>
                        <span className='font-medium text-gray-900'>
                          {issue.label}
                        </span>
                      </div>
                      <p className='text-xs text-gray-600 mt-0.5'>
                        {issue.description}
                      </p>
                      <span className='text-xs text-gray-500 capitalize'>
                        {issue.severity} severity
                      </span>
                    </div>
                  </label>

                  {/* Other description input */}
                  {type === 'other' && selected && (
                    <div className='mt-2 ml-8'>
                      <input
                        type='text'
                        value={otherDescription}
                        onChange={(e) => {
                          setOtherDescription(e.target.value);
                          const updated = selectedIssues.map((i) =>
                            i.type === 'other'
                              ? { ...i, description: e.target.value }
                              : i
                          );
                          onChange(updated);
                        }}
                        placeholder='Describe the issue...'
                        className='w-full px-3 py-2 border border-gray-300 rounded text-sm'
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary when collapsed */}
        {!expanded && selectedIssues.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {selectedIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`text-xs px-3 py-1 rounded-full border ${getSeverityColor(
                  issue.severity
                )}`}
              >
                {getSeverityIcon(issue.severity)}{' '}
                {ISSUE_DEFINITIONS[issue.type].label}
                <button
                  onClick={() => toggleIssue(issue.type)}
                  className='ml-2 hover:font-bold'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {expanded && (
          <div className='text-xs text-gray-600 flex gap-4'>
            <span>🔴 Critical: Must fix before deploy</span>
            <span>🟠 High: Should fix soon</span>
            <span>🟡 Medium: Nice to fix</span>
            <span>🔵 Low: Minor issue</span>
          </div>
        )}
      </div>
    </Card>
  );
}






