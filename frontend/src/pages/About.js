import React from 'react';
import { Card, Typography, Row, Col, Avatar } from 'antd';
import { TeamOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const About = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>About Ethiopian Tutorial App</Title>
      <Paragraph style={{ fontSize: '16px', marginBottom: '32px' }}>
        Welcome to the Ethiopian Tutorial App, a comprehensive learning platform dedicated to preserving 
        and sharing Ethiopian culture, language, and traditions.
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Avatar size={64} icon={<BookOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Learn</Title>
            <Paragraph>
              Access a wide range of tutorials covering Amharic language, Ethiopian culture, 
              history, cooking, and traditional music.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Teach</Title>
            <Paragraph>
              Share your knowledge by creating tutorials, uploading videos, 
              and building quizzes for students.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Avatar size={64} icon={<TrophyOutlined />} style={{ backgroundColor: '#fa8c16', marginBottom: 16 }} />
            <Title level={4}>Track Progress</Title>
            <Paragraph>
              Monitor your learning journey with progress tracking, 
              quiz results, and achievement certificates.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '32px' }}>
        <Title level={3}>Our Mission</Title>
        <Paragraph>
          We believe in the power of education to preserve cultural heritage and connect communities. 
          Our platform makes Ethiopian culture accessible to learners worldwide while providing 
          teachers with the tools they need to share their expertise effectively.
        </Paragraph>
        
        <Title level={3}>Features</Title>
        <ul>
          <li>Interactive video tutorials with progress tracking</li>
          <li>Comprehensive quiz system with instant feedback</li>
          <li>PDF downloads for offline learning</li>
          <li>Role-based access for students, teachers, and administrators</li>
          <li>Multi-language support for Amharic learning</li>
          <li>Certificate generation upon course completion</li>
        </ul>
      </Card>
    </div>
  );
};

export default About;
