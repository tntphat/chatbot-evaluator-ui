'use client';

import { useState } from 'react';
import { EvaluationCriterion } from '@/lib/types';

interface CriterionRatingProps {
  criterion: EvaluationCriterion;
  value: number;
  onChange: (value: number) => void;
  showRubric?: boolean;
}

export function CriterionRating({
  criterion,
  value,
  onChange,
  showRubric = true,
}: CriterionRatingProps) {
  const [showDetails, setShowDetails] = useState(false);

  const selectedRubric = criterion.rubric.find((r) => r.level === value);

  return (
    <div className='border border-gray-200 rounded-lg p-4 space-y-3'>
      {/* Criterion Header */}
      <div className='flex justify-between items-start'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='font-semibold text-gray-900'>{criterion.name}</h4>
            <span className='text-xs text-gray-500'>
              Weight: {Math.round(criterion.weight * 100)}%
            </span>
          </div>
          <p className='text-sm text-gray-600 mt-1'>{criterion.description}</p>
        </div>
        {showRubric && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap ml-2'
          >
            {showDetails ? '⊟ Hide' : '⊞ Show'} Rubric
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-700'>Rating:</span>
          <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => onChange(star)}
                className='text-3xl transition-transform hover:scale-110 focus:outline-none'
                title={criterion.rubric.find((r) => r.level === star)?.label}
              >
                {star <= value ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <span className='text-sm font-semibold text-gray-900'>{value}/5</span>
        </div>

        {/* Selected Level Description */}
        {value > 0 && selectedRubric && (
          <div className='p-3 bg-blue-50 border border-blue-200 rounded'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-blue-900'>
                {selectedRubric.label}:
              </span>
              <span className='text-sm text-blue-800'>
                {selectedRubric.description}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rubric Details (Expandable) */}
      {showDetails && (
        <div className='border-t pt-3 space-y-2'>
          <h5 className='text-xs font-semibold text-gray-700 uppercase'>
            Scoring Guide:
          </h5>
          {criterion.rubric.map((level) => (
            <div
              key={level.level}
              className={`flex gap-2 text-sm p-2 rounded transition-all ${
                value === level.level
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className='flex items-center gap-2 min-w-[100px]'>
                <span className='font-semibold text-gray-900'>
                  {level.level}:
                </span>
                <span className='text-gray-700'>{level.label}</span>
              </div>
              <p className='text-gray-600 flex-1'>{level.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






