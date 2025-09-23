import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, App, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authApi';

const { Title, Text } = Typography;

const ForceChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    // Get user data from localStorage
    const tempUser = localStorage.getItem('tempUser');
    if (tempUser) {
      setUser(JSON.parse(tempUser));
    } else {
      // If no temp user data, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Force changing password for user:', user?.email);
      const response = await authService.forceChangePassword(values);
      console.log('Force change password response:', response);
      
      // Clear temp user data
      localStorage.removeItem('tempUser');
      
      // Login user with new token
      login(response.user, response.token);
      message.success('🎉 Password changed successfully! You are now logged in.');
      navigate('/');
    } catch (error) {
      console.error('Force change password error:', error);
      
      // Provide specific error messages
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Invalid input';
        message.error(`❌ ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error('❌ Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        message.error('❌ User not found. Please contact support.');
        navigate('/login');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        message.error('❌ Failed to change password. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please enter a password'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters long'));
    }
    if (value === 'changeme') {
      return Promise.reject(new Error('You cannot use the default password. Please choose a different password.'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    const { getFieldValue } = form;
    if (!value) {
      return Promise.reject(new Error('Please confirm your password'));
    }
    if (value !== getFieldValue('newPassword')) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return Promise.resolve();
  };

  const [form] = Form.useForm();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🔐 Change Password Required
          </Title>
          <Text type="secondary">
            Welcome, <strong>{user.name}</strong>! You must change your password before continuing.
          </Text>
        </div>

        <Alert
          message="Security Notice"
          description="Your account was created by an administrator. For security reasons, you must set your own password before accessing the system."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          name="force-change-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { validator: validatePassword }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your new password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { validator: validateConfirmPassword }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your new password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: 48, fontSize: 16 }}
            >
              {loading ? 'Changing Password...' : 'Change Password & Continue'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Your default password was: <code>changeme</code>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForceChangePassword;
