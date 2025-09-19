import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message, Tabs, Divider, Row, Col, Tag } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const updatedUser = { ...user, ...values };
      updateUser(updatedUser);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await authService.changePassword(values);
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'teacher': return 'blue';
      case 'student': return 'green';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Profile Settings</Title>
      <Text type="secondary">Manage your account information and preferences</Text>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0 }}>{user?.name}</Title>
              <Text type="secondary">{user?.email}</Text>
              <div style={{ marginTop: 16 }}>
                <Tag color={getRoleColor(user?.role)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {user?.role?.toUpperCase()}
                </Tag>
              </div>
              <Divider />
              <div style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Member since:</Text>
                  <br />
                  <Text type="secondary">January 2024</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Last login:</Text>
                  <br />
                  <Text type="secondary">Today at 2:30 PM</Text>
                </div>
                <div>
                  <Text strong>Status:</Text>
                  <br />
                  <Tag color="green">Active</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="profile">
              <TabPane tab="Profile Information" key="profile">
                <Form
                  form={profileForm}
                  layout="vertical"
                  initialValues={user}
                  onFinish={handleProfileUpdate}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please input your email!' },
                          { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="role"
                        label="Role"
                      >
                        <Input disabled value={user?.role?.toUpperCase()} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<EditOutlined />}
                    >
                      Update Profile
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Change Password" key="password">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please input your current password!' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Enter current password" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Please input your new password!' },
                      { min: 6, message: 'Password must be at least 6 characters!' }
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Enter new password" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Please confirm your new password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Confirm new password" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<LockOutlined />}
                    >
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Preferences" key="preferences">
                <div style={{ padding: '20px 0' }}>
                  <Title level={4}>Notification Settings</Title>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Email notifications for new tutorials</Text>
                    <Button type="link" style={{ float: 'right' }}>Enable</Button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Push notifications for progress updates</Text>
                    <Button type="link" style={{ float: 'right' }}>Enable</Button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Weekly learning summary</Text>
                    <Button type="link" style={{ float: 'right' }}>Enable</Button>
                  </div>
                  
                  <Divider />
                  
                  <Title level={4}>Learning Preferences</Title>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Preferred language for tutorials</Text>
                    <Button type="link" style={{ float: 'right' }}>English</Button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Difficulty level preference</Text>
                    <Button type="link" style={{ float: 'right' }}>Beginner</Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
