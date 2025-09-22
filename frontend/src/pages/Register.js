import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authApi';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Force role to be student
      const studentData = { ...values, role: 'student' };
      const response = await authService.register(studentData);
      login(response.user, response.token);
      message.success('Registration successful! Welcome to Ethiopian Tutorial App!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
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
            Join as a Student
          </Title>
          <Text type="secondary">
            Start your Ethiopian cultural learning journey
          </Text>
        </div>

        <Alert
          message="Student Registration Only"
          description="Only students can register directly. Teachers and admins are created by the system administrator."
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          {/* Role is automatically set to student - hidden field */}
          <Form.Item name="role" style={{ display: 'none' }}>
            <Input value="student" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number!'
              }
            ]}
            help="Password must be at least 6 characters with uppercase, lowercase, and number"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1890ff' }}>
              Sign in here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
