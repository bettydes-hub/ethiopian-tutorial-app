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
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
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
