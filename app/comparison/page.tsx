'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Select,
  Typography,
  Table,
  Tag,
  Alert,
  Space,
  Row,
  Col,
  message,
} from 'antd';
import { SwapOutlined, DownloadOutlined, ExperimentOutlined } from '@ant-design/icons';
import { ChatbotStorage } from '@/lib/storage';
import type { Chatbot } from '@/lib/types';

const { Title, Paragraph, Text } = Typography;

export default function ComparisonPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
  }, []);

  const handleCompare = () => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      setShowComparison(true);
    }
  };

  const comparisonData = [
    { metric: 'Overall Score', a: '4.2 (85%)', b: '4.5 (90%)', change: '+5%', winner: 'B' },
    { metric: 'Accuracy', a: '85%', b: '90%', change: '+5%', winner: 'B' },
    { metric: 'Task Completion', a: '92%', b: '95%', change: '+3%', winner: 'B' },
    { metric: 'Response Time', a: '450ms', b: '380ms', change: '-70ms', winner: 'B' },
    { metric: 'Error Rate', a: '2.5%', b: '1.2%', change: '-1.3%', winner: 'B' },
    { metric: 'User Satisfaction', a: '4.1/5', b: '4.6/5', change: '+0.5', winner: 'B' },
  ];

  const columns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: 'Variant A', dataIndex: 'a', key: 'a' },
    {
      title: 'Variant B',
      dataIndex: 'b',
      key: 'b',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (text: string, record: any) => (
        <Tag color={record.winner === 'B' ? 'green' : 'default'}>{text}</Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Chatbot Comparison</Title>
      <Paragraph style={{ color: '#666', marginBottom: 24 }}>
        Compare performance between chatbot versions
      </Paragraph>

      <Card title='Select Chatbots to Compare' style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Variant A (Control)</Text>
            </div>
            <Select
              placeholder='Select chatbot...'
              size='large'
              style={{ width: '100%' }}
              value={selectedA || undefined}
              onChange={setSelectedA}
            >
              {chatbots.map((cb) => (
                <Select.Option key={cb.id} value={cb.id}>
                  {cb.name} {cb.version}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Variant B (Treatment)</Text>
            </div>
            <Select
              placeholder='Select chatbot...'
              size='large'
              style={{ width: '100%' }}
              value={selectedB || undefined}
              onChange={setSelectedB}
            >
              {chatbots.map((cb) => (
                <Select.Option
                  key={cb.id}
                  value={cb.id}
                  disabled={cb.id === selectedA}
                >
                  {cb.name} {cb.version}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Space style={{ marginTop: 16 }}>
          <Button
            type='primary'
            icon={<SwapOutlined />}
            size='large'
            onClick={handleCompare}
            disabled={!selectedA || !selectedB}
          >
            Compare
          </Button>
          <Button
            icon={<ExperimentOutlined />}
            size='large'
            onClick={() => message.info('Feature coming in Phase 2: A/B Testing')}
          >
            Run A/B Test
          </Button>
        </Space>
      </Card>

      {showComparison && (
        <>
          <Card title='Comparison Results' style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={comparisonData}
              pagination={false}
              rowKey='metric'
            />
            <Alert
              message='Winner: Variant B'
              description='Better in 6/6 metrics'
              type='success'
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>

          <Card title='Recommendations'>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Alert
                message='Deploy Variant B'
                description='Shows significant improvement across all metrics'
                type='success'
                showIcon
              />
              <Alert
                message='Suggested Rollout Strategy'
                description='Week 1: 25% → Week 2: 50% → Week 3: 100%'
                type='info'
                showIcon
              />
            </Space>
            <Space style={{ marginTop: 16 }}>
              <Button
                type='primary'
                icon={<DownloadOutlined />}
                onClick={() => message.info('Feature coming: Download report')}
              >
                Download Report
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => message.info('Feature coming: Export data')}
              >
                Export Data
              </Button>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
}
