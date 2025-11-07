'use client';

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { EvaluationCriterion } from '@/lib/types';
import {
  DEFAULT_EVALUATION_CRITERIA,
  validateCriteriaWeights,
} from '@/lib/defaultCriteria';

interface CriteriaSetupProps {
  criteria: EvaluationCriterion[];
  onChange: (criteria: EvaluationCriterion[]) => void;
}

export function CriteriaSetup({ criteria, onChange }: CriteriaSetupProps) {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(
    null
  );

  const handleLoadDefault = () => {
    onChange(DEFAULT_EVALUATION_CRITERIA);
  };

  const handleToggleEnabled = (criterionId: string) => {
    const updated = criteria.map((c) =>
      c.id === criterionId ? { ...c, enabled: !c.enabled } : c
    );
    onChange(updated);
  };

  const handleWeightChange = (criterionId: string, weight: number) => {
    const updated = criteria.map((c) =>
      c.id === criterionId ? { ...c, weight } : c
    );
    onChange(updated);
  };

  const totalWeight = criteria
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = Math.abs(totalWeight - 1.0) < 0.01;

  return (
    <Card>
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Evaluation Criteria
            </h3>
            <p className='text-sm text-gray-600'>
              Define how chatbot responses will be evaluated
            </p>
          </div>
          <Button onClick={handleLoadDefault} variant='secondary' size='sm'>
            Load Default (6 Criteria)
          </Button>
        </div>

        {/* Total Weight Validation */}
        <div className='p-4 bg-gray-50 rounded-lg'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              Total Weight:
            </span>
            <div className='flex items-center gap-2'>
              <div className='w-48 bg-gray-200 rounded-full h-4'>
                <div
                  className={`h-4 rounded-full transition-all ${
                    isValidWeight ? 'bg-green-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(totalWeight * 100, 100)}%` }}
                />
              </div>
              <span
                className={`font-bold ${
                  isValidWeight ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {Math.round(totalWeight * 100)}%
              </span>
              {isValidWeight ? '✓' : '⚠️'}
            </div>
          </div>
          {!isValidWeight && (
            <p className='text-xs text-red-600 mt-1'>
              Total weight must equal 100%
            </p>
          )}
        </div>

        {/* Criteria List */}
        <div className='space-y-3'>
          {criteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className={`border rounded-lg ${
                criterion.enabled
                  ? 'border-gray-300'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Criterion Header */}
              <div className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-3 flex-1'>
                    <input
                      type='checkbox'
                      checked={criterion.enabled}
                      onChange={() => handleToggleEnabled(criterion.id)}
                      className='mt-1 w-5 h-5'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-semibold text-gray-900'>
                          {index + 1}. {criterion.name}
                        </h4>
                        <button
                          onClick={() =>
                            setExpandedCriterion(
                              expandedCriterion === criterion.id
                                ? null
                                : criterion.id
                            )
                          }
                          className='text-xs text-blue-600 hover:text-blue-700'
                        >
                          {expandedCriterion === criterion.id
                            ? '⊟ Hide Rubric'
                            : '⊞ Show Rubric'}
                        </button>
                      </div>
                      <p className='text-sm text-gray-600 mt-1'>
                        {criterion.description}
                      </p>

                      {/* Weight Input */}
                      <div className='flex items-center gap-3 mt-2'>
                        <label className='text-sm text-gray-700'>Weight:</label>
                        <input
                          type='number'
                          min='0'
                          max='1'
                          step='0.05'
                          value={criterion.weight}
                          onChange={(e) =>
                            handleWeightChange(
                              criterion.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={!criterion.enabled}
                          className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                        <span className='text-sm text-gray-600'>
                          ({Math.round(criterion.weight * 100)}%)
                        </span>
                        <div className='flex-1 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{
                              width: `${criterion.weight * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className='text-xs text-gray-500 mt-1'>
                        Scale: {criterion.scale}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Rubric Details */}
                {expandedCriterion === criterion.id && (
                  <div className='mt-4 pl-8 space-y-2'>
                    <h5 className='text-sm font-semibold text-gray-700'>
                      Detailed Rubric:
                    </h5>
                    {criterion.rubric.map((level) => (
                      <div
                        key={level.level}
                        className='flex gap-3 text-sm p-2 bg-gray-50 rounded'
                      >
                        <div className='flex items-center gap-2 min-w-[120px]'>
                          <span className='font-semibold text-gray-900'>
                            Level {level.level}:
                          </span>
                          <span className='text-gray-600'>{level.label}</span>
                        </div>
                        <p className='text-gray-700 flex-1'>
                          {level.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='text-sm font-semibold text-blue-900 mb-2'>
            💡 Tips for Evaluation Criteria:
          </h4>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>
              • Enable 4-6 criteria for best results (not too few, not too many)
            </li>
            <li>• Ensure total weight = 100% before saving</li>
            <li>• Higher weight = more important criterion</li>
            <li>• Click "Show Rubric" to see detailed scoring guide</li>
            <li>• You can customize weights based on your priorities</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}





