import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Typography, Button } from 'antd';
import { BookOutlined, TrophyOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { tutorialService } from '../api/tutorialApi';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTutorials: 0,
    completedTutorials: 0,
    inProgressTutorials: 0,
    recentTutorials: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tutorials, progress] = await Promise.all([
        tutorialService.getAllTutorials(),
        tutorialService.getUserProgress(user.id)
      ]);

      const completed = progress.filter(p => p.status === 'completed').length;
      const inProgress = progress.filter(p => p.status === 'in_progress').length;

      setStats({
        totalTutorials: tutorials.length,
        completedTutorials: completed,
        inProgressTutorials: inProgress,
        recentTutorials: tutorials.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getCompletionPercentage = () => {
    if (stats.totalTutorials === 0) return 0;
    return Math.round((stats.completedTutorials / stats.totalTutorials) * 100);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Welcome back, {user?.name}!</Title>
      <Text type="secondary">Here's your learning progress</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tutorials"
              value={stats.totalTutorials}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completedTutorials}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgressTutorials}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={getCompletionPercentage()}
              suffix="%"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Learning Progress" extra={<Button type="link">View All</Button>}>
            <Progress
              percent={getCompletionPercentage()}
              status={getCompletionPercentage() === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: 16 }}>
              <Text>
                {stats.completedTutorials} of {stats.totalTutorials} tutorials completed
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Tutorials" extra={<Button type="link">View All</Button>}>
            <List
              dataSource={stats.recentTutorials}
              renderItem={(tutorial) => (
                <List.Item>
                  <List.Item.Meta
                    title={tutorial.title}
                    description={tutorial.description}
                  />
                  <Button type="primary" size="small">
                    Start
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
