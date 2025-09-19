import React, { useState, useEffect } from 'react';
import { Card, List, Button, Table, Tag, Typography, Row, Col, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { tutorialService } from '../api/tutorialApi';

const { Title, Text } = Typography;
const { Option } = Select;

const TeacherPage = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const data = await tutorialService.getAllTutorials();
      setTutorials(data);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTutorial = () => {
    setEditingTutorial(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTutorial = (tutorial) => {
    setEditingTutorial(tutorial);
    form.setFieldsValue(tutorial);
    setIsModalVisible(true);
  };

  const handleDeleteTutorial = async (tutorialId) => {
    try {
      await tutorialService.deleteTutorial(tutorialId);
      fetchTutorials();
    } catch (error) {
      console.error('Error deleting tutorial:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTutorial) {
        await tutorialService.updateTutorial(editingTutorial.id, values);
      } else {
        await tutorialService.createTutorial(values);
      }
      
      setIsModalVisible(false);
      fetchTutorials();
    } catch (error) {
      console.error('Error saving tutorial:', error);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => <Tag color={difficulty === 'Beginner' ? 'green' : difficulty === 'Intermediate' ? 'orange' : 'red'}>{difficulty}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button type="link" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditTutorial(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteTutorial(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2}>Teacher Dashboard</Title>
          <Text type="secondary">Manage your tutorials and track student progress</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTutorial}>
          Create Tutorial
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="My Tutorials">
            <Table
              columns={columns}
              dataSource={tutorials}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Stats">
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#1890ff' }}>{tutorials.length}</Title>
              <Text type="secondary">Total Tutorials</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingTutorial ? 'Edit Tutorial' : 'Create Tutorial'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input tutorial title!' }]}
          >
            <Input placeholder="Enter tutorial title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input tutorial description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter tutorial description" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select placeholder="Select category">
              <Option value="language">Language</Option>
              <Option value="culture">Culture</Option>
              <Option value="history">History</Option>
              <Option value="cooking">Cooking</Option>
              <Option value="music">Music</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="Difficulty"
            rules={[{ required: true, message: 'Please select difficulty!' }]}
          >
            <Select placeholder="Select difficulty">
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: 'Please input duration!' }]}
          >
            <Input placeholder="e.g., 30 minutes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherPage;
