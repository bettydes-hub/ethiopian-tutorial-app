import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Statistic, Modal, Form, Input, Select, message, Popconfirm, Space, Tabs, Menu, Dropdown } from 'antd';
import { UserOutlined, TrophyOutlined, EditOutlined, DeleteOutlined, BlockOutlined, UnlockOutlined, EyeOutlined, SettingOutlined, PlusOutlined, ClockCircleOutlined, DownOutlined, TeamOutlined, CrownOutlined, TagsOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockUsers = [
        { id: 1, name: 'Alemayehu Tadesse', email: 'student@example.com', role: 'student', status: 'active', joinDate: '2024-01-15', lastLogin: '2024-01-20', tutorialsCompleted: 3 },
        { id: 2, name: 'Dr. Meseret Bekele', email: 'teacher@example.com', role: 'teacher', status: 'active', joinDate: '2024-01-10', lastLogin: '2024-01-20', tutorialsCreated: 5 },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'student', status: 'blocked', joinDate: '2024-01-05', lastLogin: '2024-01-18', tutorialsCompleted: 1 },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'student', status: 'active', joinDate: '2024-01-12', lastLogin: '2024-01-19', tutorialsCompleted: 2 },
        { id: 5, name: 'Prof. Ahmed Hassan', email: 'ahmed@example.com', role: 'teacher', status: 'pending', joinDate: '2024-01-08', lastLogin: '2024-01-15', tutorialsCreated: 0 },
      ];
      
      const mockTutorials = [
        { id: 1, title: 'Amharic Basics', category: 'Language', difficulty: 'Beginner', students: 25 },
        { id: 2, title: 'Ethiopian History', category: 'History', difficulty: 'Intermediate', students: 18 },
        { id: 3, title: 'Traditional Cooking', category: 'Cooking', difficulty: 'Beginner', students: 32 },
      ];

      const mockCategories = [
        { id: 1, name: 'Language', description: 'Language learning tutorials', color: 'blue', tutorialCount: 15 },
        { id: 2, name: 'Culture', description: 'Ethiopian culture and traditions', color: 'purple', tutorialCount: 8 },
        { id: 3, name: 'History', description: 'Historical content and events', color: 'brown', tutorialCount: 12 },
        { id: 4, name: 'Cooking', description: 'Traditional Ethiopian recipes', color: 'orange', tutorialCount: 6 },
        { id: 5, name: 'Music', description: 'Music and dance tutorials', color: 'pink', tutorialCount: 4 },
      ];

      setUsers(mockUsers);
      setTutorials(mockTutorials);
      setCategories(mockCategories);
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
    message.success('User deleted successfully');
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: user.status === 'active' ? 'blocked' : 'active',
            lastLogin: user.status === 'active' ? user.lastLogin : new Date().toISOString().split('T')[0]
          }
        : user
    ));
    const user = users.find(u => u.id === userId);
    message.success(`User ${user.status === 'active' ? 'blocked' : 'unblocked'} successfully`);
  };


  const handleViewUser = (user) => {
    Modal.info({
      title: 'User Details',
      width: 600,
      content: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Name:</Text>
              <br />
              <Text>{user.name}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Email:</Text>
              <br />
              <Text>{user.email}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Role:</Text>
              <br />
              <Tag color={user.role === 'admin' ? 'red' : user.role === 'teacher' ? 'blue' : 'green'}>
                {user.role.toUpperCase()}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Status:</Text>
              <br />
              <Tag color={user.status === 'active' ? 'green' : 'red'}>
                {user.status.toUpperCase()}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Join Date:</Text>
              <br />
              <Text>{user.joinDate}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Last Login:</Text>
              <br />
              <Text>{user.lastLogin || 'Never'}</Text>
            </Col>
            <Col span={24}>
              <Text strong>Bio:</Text>
              <br />
              <Text>{user.bio || 'No bio provided'}</Text>
            </Col>
          </Row>
        </div>
      ),
    });
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

  // Category management functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setIsCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setIsCategoryModalVisible(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    message.success('Category deleted successfully');
  };

  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();
      
      if (editingCategory) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...values } : cat
        ));
      } else {
        const newCategory = { id: Date.now(), ...values, tutorialCount: 0 };
        setCategories([...categories, newCategory]);
      }
      
      setIsCategoryModalVisible(false);
      message.success('Category saved successfully');
    } catch (error) {
      console.error('Error saving category:', error);
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
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewUser(record)}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            icon={record.status === 'active' ? <BlockOutlined /> : <UnlockOutlined />}
            size="small" 
            onClick={() => handleToggleUserStatus(record.id)}
            style={{ color: record.status === 'active' ? '#ff4d4f' : '#52c41a' }}
          >
            {record.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
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

  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Tag color={record.color} style={{ marginBottom: 4 }}>{text}</Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Tutorials',
      dataIndex: 'tutorialCount',
      key: 'tutorialCount',
      render: (count) => <Text strong>{count}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Management dropdown menu
  const managementMenu = (
    <Menu>
      <Menu.Item key="add-teacher" icon={<TeamOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); form.setFieldsValue({ role: 'teacher' }); setIsUserModalVisible(true); }}>
        Add Teacher
      </Menu.Item>
      <Menu.Item key="add-admin" icon={<CrownOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); form.setFieldsValue({ role: 'admin' }); setIsUserModalVisible(true); }}>
        Add Admin
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="add-category" icon={<TagsOutlined />} onClick={handleAddCategory}>
        Add Category
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Dashboard</Title>
      <Text type="secondary">Manage users, tutorials, and system settings</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Students"
              value={users.filter(u => u.role === 'student' && u.status === 'active').length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Teachers"
              value={users.filter(u => u.role === 'teacher' && u.status === 'active').length}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={users.filter(u => u.status === 'pending').length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Dropdown overlay={managementMenu} trigger={['click']}>
              <Button type="primary" icon={<PlusOutlined />}>
                Management <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All Users" key="users">
            <Table
              columns={userColumns}
              dataSource={users}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Pending Teachers" key="pending">
            <Table
              columns={userColumns}
              dataSource={users.filter(u => u.role === 'teacher' && u.status === 'pending')}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Blocked Users" key="blocked">
            <Table
              columns={userColumns}
              dataSource={users.filter(u => u.status === 'blocked')}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Tutorials" key="tutorials">
            <Table
              columns={tutorialColumns}
              dataSource={tutorials}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Categories" key="categories">
            <Table
              columns={categoryColumns}
              dataSource={categories}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

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

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        visible={isCategoryModalVisible}
        onOk={handleCategoryModalOk}
        onCancel={() => setIsCategoryModalVisible(false)}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input category description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Please select a color!' }]}
          >
            <Select placeholder="Select a color">
              <Option value="blue">Blue</Option>
              <Option value="green">Green</Option>
              <Option value="red">Red</Option>
              <Option value="orange">Orange</Option>
              <Option value="purple">Purple</Option>
              <Option value="pink">Pink</Option>
              <Option value="brown">Brown</Option>
              <Option value="cyan">Cyan</Option>
              <Option value="magenta">Magenta</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
