'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Empty,
} from 'antd';
import { FilterOutlined, EyeOutlined } from '@ant-design/icons';
import {
  CampaignStorage,
  ChatbotStorage,
  DatasetStorage,
  EvaluationStorage,
} from '@/lib/storage';
import type {
  Campaign,
  Chatbot,
  EvaluationItem,
  TestDataset,
} from '@/lib/types';

const { Title, Paragraph, Text } = Typography;

const getPriorityTag = (priority?: EvaluationItem['priority']) => {
  const colors: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'default',
  };
  const level = priority ?? 'medium';
  return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
};

const getStatusTag = (status: EvaluationItem['status']) => {
  const colors: Record<EvaluationItem['status'], string> = {
    pending: 'blue',
    in_review: 'orange',
    completed: 'green',
  };
  return (
    <Tag color={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>
  );
};

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [datasets, setDatasets] = useState<TestDataset[]>([]);

  useEffect(() => {
    setEvaluations(EvaluationStorage.getAll() as EvaluationItem[]);
    setCampaigns(CampaignStorage.getAll() as Campaign[]);
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
    setDatasets(DatasetStorage.getAll() as TestDataset[]);
  }, []);

  const campaignMap = useMemo(() => {
    const map = new Map<string, Campaign>();
    campaigns.forEach((campaign) => map.set(campaign.id, campaign));
    return map;
  }, [campaigns]);

  const chatbotMap = useMemo(() => {
    const map = new Map<string, Chatbot>();
    chatbots.forEach((chatbot) => map.set(chatbot.id, chatbot));
    return map;
  }, [chatbots]);

  const datasetMap = useMemo(() => {
    const map = new Map<string, TestDataset>();
    datasets.forEach((dataset) => map.set(dataset.id, dataset));
    return map;
  }, [datasets]);

  const stats = useMemo(() => {
    return evaluations.reduce(
      (acc, evaluation) => {
        acc[evaluation.status] += 1;
        return acc;
      },
      {
        pending: 0,
        in_review: 0,
        completed: 0,
      } as Record<EvaluationItem['status'], number>
    );
  }, [evaluations]);

  const queue = useMemo(() => {
    return [...evaluations].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
      const aPriority = priorityOrder[a.priority ?? 'medium'];
      const bPriority = priorityOrder[b.priority ?? 'medium'];
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [evaluations]);

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
              value={stats.pending}
              valueStyle={{ color: '#1890ff' }}
              suffix='reviews'
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title='In Review'
              value={stats.in_review}
              valueStyle={{ color: '#fa8c16' }}
              suffix='active'
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title='Completed'
              value={stats.completed}
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
          dataSource={queue}
          locale={{
            emptyText: (
              <Empty description='No manual review tasks yet. Create a campaign with human review to start.' />
            ),
          }}
          renderItem={(evaluation) => {
            const campaign = campaignMap.get(evaluation.campaignId);
            const dataset = evaluation.datasetId
              ? datasetMap.get(evaluation.datasetId)
              : undefined;
            const chatbot = chatbotMap.get(evaluation.chatbotId);

            return (
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
                      <Text strong>
                        {evaluation.userMessage || 'Manual evaluation item'}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space size='small' wrap>
                      {campaign && (
                        <Tag color='blue'>Campaign: {campaign.name}</Tag>
                      )}
                      {dataset && (
                        <Tag color='purple'>Dataset: {dataset.name}</Tag>
                      )}
                      {chatbot && (
                        <Tag color='geekblue'>Chatbot: {chatbot.name}</Tag>
                      )}
                      {getStatusTag(evaluation.status)}
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
}
