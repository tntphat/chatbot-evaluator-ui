'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  RocketOutlined,
  DatabaseOutlined,
  StarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
  ThunderboltOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

type NavMenuItem = {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
};

type NavDivider = {
  type: 'divider';
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: Array<NavMenuItem | NavDivider> = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link href='/'>Dashboard</Link>,
    },
    {
      key: '/campaigns',
      icon: <RocketOutlined />,
      label: <Link href='/campaigns'>Campaigns</Link>,
    },
    {
      key: '/datasets',
      icon: <DatabaseOutlined />,
      label: <Link href='/datasets'>Test Datasets</Link>,
    },
    {
      key: '/evaluations',
      icon: <StarOutlined />,
      label: <Link href='/evaluations'>Evaluation Queue</Link>,
    },
    {
      key: '/conversation/demo',
      icon: <MessageOutlined />,
      label: <Link href='/conversation/demo'>Conversation Review</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: '/datasets/new',
      icon: <EditOutlined />,
      label: <Link href='/datasets/new'>Create Test Suite</Link>,
    },
    {
      key: '/evaluations/review/eval_001',
      icon: <StarOutlined />,
      label: <Link href='/evaluations/review/eval_001'>Manual Review</Link>,
    },
    {
      key: '/auto-evaluate',
      icon: <ThunderboltOutlined />,
      label: <Link href='/auto-evaluate'>Auto Evaluate</Link>,
    },
  ];

  // Find selected key based on pathname
  const getSelectedKey = (): string => {
    if (!pathname || pathname === '/') {
      return '/';
    }

    const allItems = menuItems.filter(
      (item): item is NavMenuItem =>
        'key' in item && typeof item.key === 'string' && item.key !== '/'
    );

    const matchedItem = [...allItems]
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => pathname.startsWith(item.key));

    return matchedItem?.key ?? '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 20 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '🤖' : '🤖 Chatbot Evaluator'}
        </div>
        <Menu
          theme='dark'
          mode='inline'
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: 18, cursor: 'pointer' },
              }
            )}
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Chatbot Evaluator
            </h2>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
