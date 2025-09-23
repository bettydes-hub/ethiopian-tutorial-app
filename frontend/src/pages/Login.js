import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authApi';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', values);
      const response = await authService.login(values);
      console.log('Login response:', response);
      login(response.user, response.token);
      message.success(`Welcome back, ${response.user.name}! 🎉`);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 401) {
        message.error('❌ Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 404) {
        message.error('❌ Account not found. Please check your email address or register for a new account.');
      } else if (error.response?.status === 403) {
        message.error('❌ Account is disabled. Please contact support for assistance.');
      } else if (error.response?.status === 429) {
        message.error('❌ Too many login attempts. Please wait a few minutes before trying again.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        message.error(`❌ ${errorMessage}. Please try again or contact support if the problem persists.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to your Ethiopian Tutorial App account
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { 
                required: true, 
                message: '📧 Email is required to sign in' 
              },
              { 
                type: 'email', 
                message: '📧 Please enter a valid email address (e.g., user@example.com)' 
              },
              {
                min: 5,
                message: '📧 Email must be at least 5 characters long'
              }
            ]}
            hasFeedback
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: '🔒 Password is required to sign in' 
              },
              {
                min: 6,
                message: '🔒 Password must be at least 6 characters long'
              }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1890ff' }}>
              Sign up here
            </Link>
          </Text>
          <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 6 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Test Credentials:</strong><br />
              Student: alemu@example.com / password<br />
              Teacher: meseret@example.com / password<br />
              Admin: admin@example.com / password
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
