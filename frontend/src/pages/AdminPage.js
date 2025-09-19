import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Statistic, Modal, Form, Input, Select } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'teacher', status: 'active', joinDate: '2024-01-10' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'student', status: 'inactive', joinDate: '2024-01-05' },
      ];
      
      const mockTutorials = [
        { id: 1, title: 'Amharic Basics', category: 'Language', difficulty: 'Beginner', students: 25 },
        { id: 2, title: 'Ethiopian History', category: 'History', difficulty: 'Intermediate', students: 18 },
        { id: 3, title: 'Traditional Cooking', category: 'Cooking', difficulty: 'Beginner', students: 32 },
      ];

      setUsers(mockUsers);
      setTutorials(mockTutorials);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsUserModalVisible(true);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        ));
      } else {
        const newUser = { id: Date.now(), ...values, joinDate: new Date().toISOString().split('T')[0] };
        setUsers([...users, newUser]);
      }
      
      setIsUserModalVisible(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'teacher' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditUser(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteUser(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tutorialColumns = [
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
      render: (difficulty) => (
        <Tag color={difficulty === 'Beginner' ? 'green' : difficulty === 'Intermediate' ? 'orange' : 'red'}>
          {difficulty}
        </Tag>
      ),
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Dashboard</Title>
      <Text type="secondary">Manage users, tutorials, and system settings</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Tutorials"
              value={tutorials.length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Students"
              value={users.filter(u => u.role === 'student' && u.status === 'active').length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="User Management" 
            extra={<Button type="primary" onClick={() => { setEditingUser(null); form.resetFields(); setIsUserModalVisible(true); }}>Add User</Button>}
          >
            <Table
              columns={userColumns}
              dataSource={users}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tutorial Overview">
            <Table
              columns={tutorialColumns}
              dataSource={tutorials}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        visible={isUserModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsUserModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input user name!' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select placeholder="Select role">
              <Option value="student">Student</Option>
              <Option value="teacher">Teacher</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
