'use client';

import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  List,
} from 'antd';
import { StarOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function EvaluationsPage() {
  const mockEvaluations = [
    {
      id: '1',
      conversation: 'Customer refund request',
      chatbot: 'Support Bot v2.1',
      status: 'pending',
      priority: 'high',
    },
    {
      id: '2',
      conversation: 'Product inquiry',
      chatbot: 'Sales Bot v1.5',
      status: 'in_review',
      priority: 'medium',
    },
    {
      id: '3',
      conversation: 'General question',
      chatbot: 'FAQ Bot v3.0',
      status: 'completed',
      priority: 'low',
    },
  ];

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'default',
    };
    return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'blue',
      in_review: 'orange',
      completed: 'green',
    };
    return (
      <Tag color={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>
    );
  };

  return (
    <div>
      <Title level={2}>Human Evaluation Portal</Title>
      <Paragraph style={{ color: '#666', marginBottom: 24 }}>
        Review and rate chatbot conversations
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title='Pending'
              value={12}
              valueStyle={{ color: '#1890ff' }}
              suffix='reviews'
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title='In Review'
              value={3}
              valueStyle={{ color: '#fa8c16' }}
              suffix='active'
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title='Completed'
              value={156}
              valueStyle={{ color: '#52c41a' }}
              suffix='done'
            />
          </Card>
        </Col>
      </Row>

      <Card
        title='Evaluation Queue'
        extra={
          <Button icon={<FilterOutlined />} onClick={() => {}}>
            Filter
          </Button>
        }
      >
        <List
          dataSource={mockEvaluations}
          renderItem={(evaluation) => (
            <List.Item
              actions={[
                <Button
                  key='review'
                  type='primary'
                  icon={<EyeOutlined />}
                  href={`/evaluations/review/${evaluation.id}`}
                >
                  Review Now
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {getPriorityTag(evaluation.priority)}
                    <Text strong>{evaluation.conversation}</Text>
                  </Space>
                }
                description={
                  <Space>
                    <Text type='secondary'>{evaluation.chatbot}</Text>
                    {getStatusTag(evaluation.status)}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
