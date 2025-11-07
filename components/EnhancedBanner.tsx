'use client';

import Link from 'next/link';
import { Button } from './ui/Button';

export function EnhancedBanner() {
  return (
    <div className='bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b-2 border-blue-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>✨</span>
            <div>
              <h3 className='text-sm font-bold text-gray-900'>
                Enhanced Features - POC Demo
              </h3>
              <p className='text-xs text-gray-700'>
                All 4 Business Processes implemented with full features
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-2'>
            <Link href='/datasets/new-enhanced'>
              <Button variant='ghost' size='sm'>
                <span className='text-xs'>Process #1</span>
              </Button>
            </Link>
            <Link href='/evaluations/enhanced/eval_001'>
              <Button variant='ghost' size='sm'>
                <span className='text-xs'>Process #2</span>
              </Button>
            </Link>
            <Link href='/auto-evaluate-enhanced'>
              <Button variant='ghost' size='sm'>
                <span className='text-xs'>Process #3</span>
              </Button>
            </Link>
            <Link href='/comparison-enhanced'>
              <Button variant='ghost' size='sm'>
                <span className='text-xs'>Process #4</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





