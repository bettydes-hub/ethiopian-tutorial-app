import React, { useState, useEffect } from 'react';
import { Card, List, Button, Progress, Tag, Typography, Row, Col } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { tutorialService } from '../api/tutorialApi';

const { Title, Text } = Typography;

const StudentPage = () => {
  const [tutorials, setTutorials] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [tutorialsData, progressData] = await Promise.all([
        tutorialService.getAllTutorials(),
        tutorialService.getUserProgress(localStorage.getItem('userId'))
      ]);
      
      setTutorials(tutorialsData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTutorialProgress = (tutorialId) => {
    const userProgress = progress.find(p => p.tutorialId === tutorialId);
    return userProgress || { status: 'not_started', progress: 0 };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'processing';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'in_progress': return <ClockCircleOutlined />;
      default: return <PlayCircleOutlined />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>My Learning Journey</Title>
      <Text type="secondary">Continue your Ethiopian cultural education</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {tutorials.map((tutorial) => {
          const userProgress = getTutorialProgress(tutorial.id);
          
          return (
            <Col xs={24} sm={12} lg={8} key={tutorial.id}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </div>
                }
                actions={[
                  <Button 
                    type="primary" 
                    icon={getStatusIcon(userProgress.status)}
                    style={{ width: '100%' }}
                  >
                    {userProgress.status === 'completed' ? 'Review' : 
                     userProgress.status === 'in_progress' ? 'Continue' : 'Start'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={tutorial.title}
                  description={tutorial.description}
                />
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Progress</Text>
                    <Tag color={getStatusColor(userProgress.status)}>
                      {userProgress.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                  
                  <Progress 
                    percent={userProgress.progress} 
                    size="small"
                    status={userProgress.status === 'completed' ? 'success' : 'active'}
                  />
                  
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {tutorial.duration} • {tutorial.difficulty}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StudentPage;
