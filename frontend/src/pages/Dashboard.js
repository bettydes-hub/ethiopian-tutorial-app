import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Typography, Button } from 'antd';
import { BookOutlined, TrophyOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { tutorialService } from '../api/tutorialApi';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalTutorials: 0,
    completedTutorials: 0,
    inProgressTutorials: 0,
    recentTutorials: []
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.id) return; // Don't fetch data if user is not available
    
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
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [user, fetchDashboardData]);

  if (loading || !user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const getCompletionPercentage = () => {
    if (stats.totalTutorials === 0) return 0;
    return Math.round((stats.completedTutorials / stats.totalTutorials) * 100);
  };

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          Welcome back, {user?.name}! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Here's your learning progress
        </Text>
      </div>

      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Total Tutorials"
              value={stats.totalTutorials}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#262626', fontSize: '28px', fontWeight: '600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Completed"
              value={stats.completedTutorials}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="In Progress"
              value={stats.inProgressTutorials}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: '600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Completion Rate"
              value={getCompletionPercentage()}
              suffix="%"
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: '600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="content-row">
        <Col xs={24} lg={12}>
          <Card 
            className="progress-card" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrophyOutlined style={{ color: '#52c41a' }} />
                Learning Progress
              </div>
            } 
            extra={<Button type="link" style={{ color: '#1890ff' }}>View All</Button>}
          >
            <div style={{ padding: '8px 0' }}>
              <Progress
                percent={getCompletionPercentage()}
                status={getCompletionPercentage() === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                strokeWidth={8}
                style={{ marginBottom: '16px' }}
              />
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                  {stats.completedTutorials} of {stats.totalTutorials} tutorials completed
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            className="tutorials-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#1890ff' }} />
                Recent Tutorials
              </div>
            } 
            extra={<Button type="link" style={{ color: '#1890ff' }}>View All</Button>}
          >
            {stats.recentTutorials.length > 0 ? (
              <List
                dataSource={stats.recentTutorials}
                renderItem={(tutorial) => (
                  <List.Item className="tutorial-item">
                    <List.Item.Meta
                      title={<Text style={{ fontWeight: '500' }}>{tutorial.title}</Text>}
                      description={<Text type="secondary">{tutorial.description}</Text>}
                    />
                    <Button type="primary" size="small" style={{ borderRadius: '6px' }}>
                      Start
                    </Button>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>No tutorials available yet</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
