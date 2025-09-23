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
      title: 'Structured Learning Paths',
      description: 'Follow carefully designed educational sequences that build your knowledge step-by-step, from beginner to advanced levels.'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Achievement-Based Learning',
      description: 'Stay motivated with clear learning milestones, certificates, and progress tracking that celebrates your educational growth.'
    },
    {
      icon: <PlayCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: 'Interactive Assessment',
      description: 'Reinforce your learning with smart quizzes and practical exercises that adapt to your skill level and learning pace.'
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      title: 'Expert-Led Education',
      description: 'Learn from certified educators and subject specialists who bring authentic knowledge and professional teaching expertise.'
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
      content: 'This educational platform has transformed my learning experience. The structured approach and expert guidance have significantly improved my academic performance.',
      avatar: 'A'
    },
    {
      name: 'Dr. Meseret Bekele',
      role: 'Educator',
      content: 'Teaching through this platform enables me to deliver high-quality education to students globally, ensuring they receive comprehensive and authentic learning experiences.',
      avatar: 'M'
    },
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'The educational methodology here is exceptional. I\'ve gained deep insights and advanced my knowledge through well-designed courses and expert instruction.',
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
            Learn With Us for Better Education
          </Title>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '20px', 
            marginBottom: 32,
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Join our educational platform to master new skills, explore diverse subjects, 
            and advance your knowledge. Experience interactive learning designed 
            to enhance your understanding and academic growth.
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
            <Title level={2}>Why Learn With Us?</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Transform your education with our comprehensive learning approach
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


        {/* Testimonials Section */}
        <div style={{ padding: '80px 24px', background: '#fafafa' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Title level={2}>Success Stories from Our Learners</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Discover how our educational approach has transformed learning experiences
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
            Advancing education through comprehensive interactive learning
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
