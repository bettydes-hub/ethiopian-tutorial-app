import React from 'react';
import { Layout, Row, Col, Card, Button, Typography, Statistic, List, Avatar, Divider } from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'Comprehensive Tutorials',
      description: 'Learn Ethiopian culture, language, history, and traditions through interactive video tutorials and downloadable materials.'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Track Your Progress',
      description: 'Monitor your learning journey with detailed progress tracking and achievement badges.'
    },
    {
      icon: <PlayCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with engaging quizzes and get instant feedback on your performance.'
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      title: 'Expert Teachers',
      description: 'Learn from qualified Ethiopian educators and cultural experts who are passionate about sharing knowledge.'
    }
  ];

  const stats = [
    { title: 'Students', value: '2,500+', icon: <UserOutlined /> },
    { title: 'Tutorials', value: '150+', icon: <BookOutlined /> },
    { title: 'Teachers', value: '50+', icon: <TeamOutlined /> },
    { title: 'Categories', value: '8+', icon: <GlobalOutlined /> }
  ];

  const testimonials = [
    {
      name: 'Alemayehu Tadesse',
      role: 'Student',
      content: 'This platform has helped me reconnect with my Ethiopian heritage. The tutorials are comprehensive and easy to follow.',
      avatar: 'A'
    },
    {
      name: 'Dr. Meseret Bekele',
      role: 'Teacher',
      content: 'Teaching through this platform allows me to reach students worldwide and share Ethiopian culture effectively.',
      avatar: 'M'
    },
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'As someone interested in Ethiopian culture, this platform provides authentic and well-structured learning materials.',
      avatar: 'S'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
          Ethiopian Tutorial App
        </div>
        <div>
          <Button 
            type="primary" 
            ghost 
            onClick={() => navigate('/login')}
            style={{ marginRight: 8 }}
          >
            Login
          </Button>
          <Button 
            type="default" 
            ghost
            onClick={() => navigate('/register')}
          >
            Join as Student
          </Button>
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            Discover Ethiopian Culture & Heritage
          </Title>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '20px', 
            marginBottom: 32,
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Learn Ethiopian languages, traditions, history, and culture through interactive tutorials, 
            quizzes, and expert-led content designed for learners of all levels.
          </Paragraph>
          <div>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/register')}
              style={{ marginRight: 16 }}
            >
              Start Learning Today
            </Button>
            <Button 
              size="large"
              ghost
              onClick={() => navigate('/login')}
            >
              Already a Member? Login
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 24px', background: '#fafafa' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Title level={2}>Why Choose Our Platform?</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Experience the best in Ethiopian cultural education
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={6} key={index}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  bodyStyle={{ padding: '32px 24px' }}
                >
                  <div style={{ marginBottom: 24 }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Stats Section */}
        <div style={{ padding: '80px 24px', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Title level={2}>Join Our Growing Community</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Thousands of learners are already discovering Ethiopian culture
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={12} md={6} key={index}>
                <div style={{ textAlign: 'center' }}>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.icon}
                    valueStyle={{ 
                      color: '#1890ff',
                      fontSize: '36px',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Testimonials Section */}
        <div style={{ padding: '80px 24px', background: '#fafafa' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Title level={2}>What Our Community Says</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Hear from students and teachers who are part of our learning community
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card style={{ height: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar 
                      size={64} 
                      style={{ 
                        backgroundColor: '#1890ff',
                        fontSize: '24px',
                        marginBottom: 16
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Title level={4} style={{ margin: 0 }}>
                      {testimonial.name}
                    </Title>
                    <Text type="secondary">{testimonial.role}</Text>
                  </div>
                  <Paragraph style={{ fontStyle: 'italic', textAlign: 'center' }}>
                    "{testimonial.content}"
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
            Ready to Start Your Journey?
          </Title>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '18px', 
            marginBottom: 32,
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Join thousands of learners discovering the rich culture and heritage of Ethiopia.
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/register')}
            style={{ 
              background: 'white',
              color: '#1890ff',
              border: 'none',
              fontSize: '16px',
              height: '48px',
              padding: '0 32px'
            }}
          >
            Get Started Now
          </Button>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ 
        background: '#001529', 
        color: 'white', 
        textAlign: 'center',
        padding: '48px 24px'
      }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
            Ethiopian Tutorial App
          </Title>
          <Paragraph style={{ color: '#ccc', fontSize: '16px' }}>
            Preserving and sharing Ethiopian culture through modern education
          </Paragraph>
        </div>
        
        <Divider style={{ borderColor: '#333' }} />
        
        <div style={{ color: '#999' }}>
          <Text>© 2024 Ethiopian Tutorial App. All rights reserved.</Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default LandingPage;
