'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Select,
  Typography,
  Space,
  message,
  Row,
  Col,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { CampaignStorage, ChatbotStorage, DatasetStorage } from '@/lib/storage';
import type { Chatbot, TestDataset } from '@/lib/types';
import Link from 'next/link';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function NewCampaignPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [datasets, setDatasets] = useState<TestDataset[]>([]);

  useEffect(() => {
    setChatbots(ChatbotStorage.getAll() as Chatbot[]);
    setDatasets(DatasetStorage.getAll() as TestDataset[]);
  }, []);

  const onFinish = (values: any) => {
    const newCampaign = {
      id: `camp_${Date.now()}`,
      name: values.name,
      description: values.description || '',
      chatbotIds: values.chatbotIds || [],
      evaluationType: values.evaluationType || ['automated'],
      datasetId: values.datasetId,
      status: 'draft' as const,
      metrics: values.metrics || ['accuracy', 'quality'],
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    CampaignStorage.add(newCampaign);
    message.success('Campaign created successfully!');
    router.push('/campaigns');
  };

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Link href='/campaigns'>
          <Button icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
      </Space>

      <Title level={2}>Create Evaluation Campaign</Title>
      <Paragraph style={{ color: '#666', marginBottom: 24 }}>
        Set up a new evaluation campaign for your chatbot
      </Paragraph>

      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Card title='Basic Information' style={{ marginBottom: 16 }}>
          <Form.Item
            label='Campaign Name'
            name='name'
            rules={[{ required: true, message: 'Please enter campaign name!' }]}
          >
            <Input placeholder='e.g., Q4 2024 Product Launch Evaluation' size='large' />
          </Form.Item>

          <Form.Item label='Description' name='description'>
            <TextArea
              rows={3}
              placeholder='Brief description of this evaluation campaign...'
            />
          </Form.Item>
        </Card>

        <Card title='Select Chatbot(s)' style={{ marginBottom: 16 }}>
          <Form.Item name='chatbotIds'>
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                {chatbots.map((chatbot) => (
                  <Card key={chatbot.id} size='small' hoverable>
                    <Checkbox value={chatbot.id}>
                      <strong>
                        {chatbot.name} {chatbot.version}
                      </strong>
                      <div style={{ color: '#666', fontSize: 12 }}>
                        {chatbot.description}
                      </div>
                    </Checkbox>
                  </Card>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Card>

        <Card title='Evaluation Type' style={{ marginBottom: 16 }}>
          <Form.Item name='evaluationType'>
            <Checkbox.Group>
              <Space direction='vertical'>
                <Checkbox value='automated'>
                  <strong>Automated Testing</strong>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    Run automated metrics calculation
                  </div>
                </Checkbox>
                <Checkbox value='human'>
                  <strong>Human Evaluation</strong>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    Manual review by human evaluators
                  </div>
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Card>

        <Card title='Test Dataset' style={{ marginBottom: 16 }}>
          <Form.Item name='datasetId' label='Select Dataset'>
            <Select
              placeholder='Select a dataset (optional)'
              size='large'
              allowClear
            >
              {datasets.map((dataset) => (
                <Select.Option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.itemCount} items)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        <Card title='Metrics to Measure' style={{ marginBottom: 24 }}>
          <Form.Item name='metrics'>
            <Checkbox.Group>
              <Row>
                {[
                  'accuracy',
                  'quality',
                  'taskCompletion',
                  'responseTime',
                  'errorRate',
                  'toxicity',
                ].map((metric) => (
                  <Col span={8} key={metric}>
                    <Checkbox value={metric} style={{ marginBottom: 8 }}>
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Card>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <Link href='/campaigns'>
            <Button>Cancel</Button>
          </Link>
          <Button type='primary' htmlType='submit' icon={<SaveOutlined />} size='large'>
            Create Campaign
          </Button>
        </div>
      </Form>
    </div>
  );
}
