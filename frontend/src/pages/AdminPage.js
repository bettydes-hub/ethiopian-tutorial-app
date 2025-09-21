import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Statistic, Modal, Form, Input, Select, message, Popconfirm, Space, Tabs, Menu, Dropdown } from 'antd';
import { UserOutlined, TrophyOutlined, EditOutlined, DeleteOutlined, BlockOutlined, UnlockOutlined, EyeOutlined, SettingOutlined, PlusOutlined, ClockCircleOutlined, DownOutlined, TeamOutlined, CrownOutlined, TagsOutlined } from '@ant-design/icons';
import { userService } from '../api/userApi';
import { tutorialService } from '../api/tutorialApi';
import { categoryService } from '../api/categoryApi';

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
      const [usersData, tutorialsData, categoriesData] = await Promise.all([
        userService.getAllUsers(),
        tutorialService.getAllTutorials(),
        categoryService.getAllCategories()
      ]);

      setUsers(usersData);
      setTutorials(tutorialsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      message.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsUserModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user.status === 'active') {
        await userService.blockUser(userId);
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: 'blocked' } : u
        ));
        message.success('User blocked successfully');
      } else {
        await userService.unblockUser(userId);
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: 'active' } : u
        ));
        message.success('User unblocked successfully');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Failed to update user status');
    }
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
        const updatedUser = await userService.updateUser(editingUser.id, values);
        setUsers(users.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ));
        message.success('User updated successfully');
      } else {
        const newUser = await userService.createUser(values);
        setUsers([...users, newUser]);
        message.success('User created successfully');
      }
      
      setIsUserModalVisible(false);
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Failed to save user');
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

  const handleDeleteCategory = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      message.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Failed to delete category');
    }
  };

  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();
      
      if (editingCategory) {
        const updatedCategory = await categoryService.updateCategory(editingCategory.id, values);
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        message.success('Category updated successfully');
      } else {
        const newCategory = await categoryService.createCategory(values);
        setCategories([...categories, newCategory]);
        message.success('Category created successfully');
      }
      
      setIsCategoryModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Failed to save category');
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
