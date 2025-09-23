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
      message.success(`🎉 Welcome to Ethiopian Tutorial App, ${response.user.name}! Your account has been created successfully.`);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid registration data';
        if (errorMessage.includes('email')) {
          message.error('❌ Email already exists. Please use a different email address or try logging in.');
        } else if (errorMessage.includes('password')) {
          message.error('❌ Password requirements not met. Please ensure your password is at least 6 characters long.');
        } else {
          message.error(`❌ ${errorMessage}. Please check your information and try again.`);
        }
      } else if (error.response?.status === 409) {
        message.error('❌ Account already exists with this email. Please try logging in instead.');
      } else if (error.response?.status === 422) {
        message.error('❌ Please fill in all required fields correctly.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
            rules={[
              { 
                required: true, 
                message: '👤 Full name is required' 
              },
              {
                min: 2,
                message: '👤 Name must be at least 2 characters long'
              },
              {
                max: 50,
                message: '👤 Name must be less than 50 characters'
              },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: '👤 Name can only contain letters and spaces'
              }
            ]}
            hasFeedback
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { 
                required: true, 
                message: '📧 Email is required' 
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
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </Form.Item>

          {/* Role is automatically set to student - hidden field */}
          <Form.Item name="role" style={{ display: 'none' }}>
            <Input value="student" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: '🔒 Password is required' 
              },
              { 
                min: 6, 
                message: '🔒 Password must be at least 6 characters long' 
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '🔒 Password must contain at least one lowercase letter, one uppercase letter, and one number'
              }
            ]}
            help="💡 Password must be at least 6 characters with uppercase, lowercase, and number"
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { 
                required: true, 
                message: '🔒 Please confirm your password' 
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('🔒 Passwords do not match. Please make sure both passwords are identical.'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
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
