'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/campaigns', label: 'Campaigns', icon: '🎯' },
    { href: '/datasets', label: 'Datasets', icon: '📚' },
    { href: '/evaluations', label: 'Evaluations', icon: '⭐' },
    { href: '/comparison', label: 'Comparison', icon: '⚖️' },
  ];

  return (
    <nav className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <Link href='/' className='flex-shrink-0 flex items-center'>
              <span className='text-2xl font-bold text-blue-600'>
                🤖 Chatbot Evaluator
              </span>
            </Link>
            <div className='hidden sm:ml-8 sm:flex sm:space-x-4'>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className='mr-2'>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className='flex items-center'>
            <button className='p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100'>
              <span className='text-xl'>⚙️</span>
            </button>
            <button className='ml-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100'>
              <span className='text-xl'>👤</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
