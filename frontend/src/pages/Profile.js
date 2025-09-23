import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message, Tabs, Divider, Row, Col, Tag, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const passwordTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (passwordTimeoutRef.current) {
        clearTimeout(passwordTimeoutRef.current);
      }
    };
  }, []);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      updateUser(updatedUser);
      message.success('✅ Profile updated successfully! Your changes have been saved.');
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 429) {
        message.error('⏰ Too many requests. Please wait a few minutes before trying again.');
      } else if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Access forbidden';
        if (errorMessage.includes('Account is not active') || errorMessage.includes('blocked')) {
          message.error({
            content: '🚫 Your account is currently blocked or inactive. You cannot update your profile at this time. Please contact support for assistance.',
            duration: 8,
            style: { marginTop: '20vh' }
          });
        } else {
          message.error('🚫 Access denied. You do not have permission to perform this action.');
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid profile data';
        if (errorMessage.includes('Email already exists')) {
          message.error('📧 This email is already in use. Please choose a different email address.');
        } else {
          message.error(`❌ ${errorMessage}`);
        }
      } else if (error.response?.status === 401) {
        message.error('🔒 Session expired. Please log in again and try updating your profile.');
      } else if (error.response?.status === 500) {
        message.error('🚨 Server error. Please try again in a few moments or contact support.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('🌐 Network error. Please check your internet connection and try again.');
      } else {
        message.error('❌ Failed to update profile. Please try again or contact support if the problem persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    // Clear any existing timeout
    if (passwordTimeoutRef.current) {
      clearTimeout(passwordTimeoutRef.current);
    }

    // Prevent rapid successive calls
    if (passwordLoading) {
      message.warning('⏳ Please wait, password change is already in progress...');
      return;
    }

    setPasswordLoading(true);
    
    try {
      await authService.changePassword(values);
      message.success('🔐 Password changed successfully! Your account is now more secure.');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Password change error:', error);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 429) {
        message.error('⏰ Too many requests. Please wait a few minutes before trying again.');
      } else if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Access forbidden';
        if (errorMessage.includes('Account is not active') || errorMessage.includes('blocked')) {
          message.error({
            content: '🚫 Your account is currently blocked or inactive. You cannot change your password at this time. Please contact support for assistance.',
            duration: 8,
            style: { marginTop: '20vh' }
          });
        } else {
          message.error('🚫 Access denied. You do not have permission to perform this action.');
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid password data';
        if (errorMessage.includes('Current password is incorrect')) {
          message.error('❌ Current password is incorrect. Please check and try again.');
        } else {
          message.error(`❌ ${errorMessage}`);
        }
      } else if (error.response?.status === 401) {
        message.error('🔒 Session expired. Please log in again and try changing your password.');
      } else if (error.response?.status === 500) {
        message.error('🚨 Server error. Please try again in a few moments or contact support.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('🌐 Network error. Please check your internet connection and try again.');
      } else {
        message.error('❌ Failed to change password. Please try again or contact support if the problem persists.');
      }
    } finally {
      // Add a small delay before allowing another password change attempt
      passwordTimeoutRef.current = setTimeout(() => {
        setPasswordLoading(false);
      }, 2000); // 2 second cooldown
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'blocked': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Approval';
      case 'blocked': return 'Blocked';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Profile Settings</Title>
      <Text type="secondary">Manage your account information and preferences</Text>

      {/* Account Status Warning */}
      {user?.status && user.status !== 'active' && (
        <Alert
          message={
            user.status === 'blocked' 
              ? '🚫 Account Blocked' 
              : user.status === 'pending' 
                ? '⏳ Account Pending Approval' 
                : '⚠️ Account Inactive'
          }
          description={
            user.status === 'blocked' 
              ? 'Your account has been blocked. You have limited access to features. Please contact support for assistance.'
              : user.status === 'pending' 
                ? 'Your account is pending admin approval. You have limited access until approved.'
                : 'Your account is not active. Please contact support for assistance.'
          }
          type={user.status === 'blocked' ? 'error' : 'warning'}
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginTop: '16px', marginBottom: '24px' }}
          action={
            <Button size="small" type="link" href="mailto:support@ethiopiantutorial.com">
              Contact Support
            </Button>
          }
        />
      )}

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0 }}>{user?.name}</Title>
              <Text type="secondary">{user?.email}</Text>
              <div style={{ marginTop: 16 }}>
                <Tag color={getRoleColor(user?.role)} style={{ fontSize: '14px', padding: '4px 12px', marginBottom: '8px' }}>
                  {user?.role?.toUpperCase()}
                </Tag>
                <br />
                <Tag color={getStatusColor(user?.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {getStatusText(user?.status)}
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
                  disabled={user?.status && user.status !== 'active'}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: '👤 Please enter your full name' },
                      { min: 2, message: '👤 Name must be at least 2 characters long' },
                      { max: 50, message: '👤 Name must be less than 50 characters' }
                    ]}
                    hasFeedback
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter your full name (e.g., John Doe)" 
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: '📧 Please enter your email address' },
                          { type: 'email', message: '📧 Please enter a valid email address (e.g., user@example.com)' },
                          { max: 100, message: '📧 Email must be less than 100 characters' }
                        ]}
                        hasFeedback
                      >
                        <Input 
                          prefix={<MailOutlined />} 
                          placeholder="Enter your email address (e.g., user@example.com)" 
                          maxLength={100}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                          { max: 20, message: '📞 Phone number must be less than 20 characters' },
                          {
                            pattern: /^[\+]?[1-9][\d]{0,15}$/,
                            message: '📞 Please enter a valid phone number (e.g., +1234567890)'
                          }
                        ]}
                        hasFeedback
                      >
                        <Input 
                          prefix={<PhoneOutlined />} 
                          placeholder="Enter your phone number (e.g., +1234567890)" 
                          maxLength={20}
                        />
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
                    rules={[
                      { max: 500, message: '📝 Bio must be less than 500 characters' }
                    ]}
                    hasFeedback
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="Tell us about yourself... (Optional - Share your interests, background, or goals)"
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
                {user?.status && user.status !== 'active' && (
                  <Alert
                    message="Password Change Unavailable"
                    description={
                      user.status === 'blocked' 
                        ? 'You cannot change your password while your account is blocked. Please contact support for assistance.'
                        : user.status === 'pending' 
                          ? 'You cannot change your password until your account is approved by an administrator.'
                          : 'You cannot change your password while your account is inactive. Please contact support for assistance.'
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />
                )}
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                  disabled={user?.status && user.status !== 'active'}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[
                      { required: true, message: '🔐 Please enter your current password' },
                      { min: 6, message: '🔐 Current password must be at least 6 characters' }
                    ]}
                    hasFeedback
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Enter your current password to verify your identity" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: '🔐 Please enter your new password' },
                      { min: 6, message: '🔐 Password must be at least 6 characters long' },
                      { max: 128, message: '🔐 Password must be less than 128 characters' },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: '🔐 Password must contain at least one lowercase letter, one uppercase letter, and one number'
                      }
                    ]}
                    hasFeedback
                    help="💡 Password must be 6-128 characters with at least one uppercase letter, one lowercase letter, and one number"
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Enter a strong new password" 
                      maxLength={128}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '🔐 Please confirm your new password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('🔐 Passwords do not match! Please make sure both passwords are identical.'));
                        },
                      }),
                    ]}
                    hasFeedback
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Re-enter your new password to confirm" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={passwordLoading}
                      icon={<LockOutlined />}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Changing Password...' : 'Change Password'}
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
