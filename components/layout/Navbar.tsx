'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  category: 'main';
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: '📊', category: 'main' },
    { href: '/campaigns', label: 'Campaigns', icon: '🎯', category: 'main' },
    { href: '/datasets', label: 'Test Datasets', icon: '📚', category: 'main' },
    {
      href: '/evaluations',
      label: 'Evaluation Queue',
      icon: '⭐',
      category: 'main',
    },
  ];

  const categories = {
    main: 'Main Navigation',
  };

  return (
    <nav className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            {/* Logo */}
            <Link href='/' className='flex-shrink-0 flex items-center'>
              <span className='text-2xl font-bold text-blue-600'>
                🤖 Chatbot Evaluator
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden lg:ml-8 lg:flex lg:space-x-1'>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + '/');
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className='flex items-center gap-2'>
            {/* Settings & Profile (always visible) */}
            <button
              className='p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              title='Settings'
            >
              <span className='text-xl'>⚙️</span>
            </button>
            <button
              className='p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              title='Profile'
            >
              <span className='text-xl'>👤</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              aria-label='Toggle menu'
            >
              <span className='text-2xl'>{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='lg:hidden py-4 border-t border-gray-200'>
            <div className='space-y-1'>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className='mr-3 text-xl'>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
