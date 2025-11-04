import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
    >
      {(title || subtitle || action) && (
        <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-start'>
          <div>
            {title && (
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            )}
            {subtitle && (
              <p className='text-sm text-gray-800 mt-1'>{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className='p-6'>{children}</div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-700'>{title}</p>
          <p className='mt-2 text-3xl font-bold text-gray-900'>{value}</p>
          {change && (
            <div className='mt-2 flex items-center'>
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${changeColors[changeType]}`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && <div className='text-4xl opacity-50'>{icon}</div>}
      </div>
    </div>
  );
}
