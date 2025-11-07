'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/campaigns', label: 'Campaigns', icon: '🚀' },
    { href: '/datasets', label: 'Datasets', icon: '📚' },
    { href: '/evaluations', label: 'Evaluations', icon: '⭐' },
    { href: '/evaluate-response', label: 'Rate Response', icon: '📝' },
    { href: '/auto-evaluate-v2', label: 'Auto Evaluate', icon: '🤖' },
    { href: '/real-conversations', label: 'Real Data', icon: '💬' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-800 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-slate-700'>
        <div className='flex items-center gap-3'>
          <div className='text-3xl'>🤖</div>
          {!collapsed && (
            <div>
              <div className='font-bold text-lg'>Chatbot Evaluator</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className='p-1 hover:bg-slate-700 rounded transition-colors'
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className='text-xl'>{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className='py-4'>
        <ul className='space-y-1'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className='text-xl flex-shrink-0'>{item.icon}</span>
                  {!collapsed && (
                    <span className='font-medium'>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700'>
        <div className='space-y-2'>
          <button
            className='flex items-center gap-3 px-4 py-2 w-full text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors'
            title={collapsed ? 'Settings' : ''}
          >
            <span className='text-xl'>⚙️</span>
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            className='flex items-center gap-3 px-4 py-2 w-full text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors'
            title={collapsed ? 'Profile' : ''}
          >
            <span className='text-xl'>👤</span>
            {!collapsed && <span>Profile</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
