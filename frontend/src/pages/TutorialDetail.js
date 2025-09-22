import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Progress, Typography, Row, Col, Tag, Rate, Divider, message, Spin, Tabs } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, LeftOutlined, CheckCircleOutlined, ClockCircleOutlined, QuestionCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorialService } from '../api/tutorialApi';
import { quizService } from '../api/quizApi';
import { generateTutorialPDF, generateCertificate } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import Quiz from '../components/Quiz';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('content');

  const fetchTutorial = useCallback(async () => {
    try {
      const tutorialData = await tutorialService.getTutorialById(parseInt(id));
      setTutorial(tutorialData);
      
      // Fetch quizzes for this tutorial
      const quizzesData = await quizService.getQuizzesByTutorial(parseInt(id));
      setQuizzes(quizzesData);
      
      // Fetch user progress for this tutorial
      if (user?.id) {
        const progressData = await tutorialService.getUserProgress(user.id);
        const userProgress = progressData.find(p => p.tutorialId === parseInt(id));
        if (userProgress) {
          setProgress(userProgress.progress);
          setCompleted(userProgress.status === 'completed');
        }
      }
    } catch (error) {
      message.error('Failed to load tutorial');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchTutorial();
  }, [fetchTutorial]);

  const handleStartVideo = () => {
    setVideoPlaying(true);
    message.success('Video started!');
  };

  const handleDownloadPDF = () => {
    if (tutorial) {
      generateTutorialPDF(tutorial);
      message.success('Course notes downloaded successfully!');
    }
  };

  const handleDownloadCertificate = () => {
    if (tutorial && user?.name) {
      generateCertificate(tutorial, user.name);
      message.success('Certificate downloaded successfully!');
    }
  };

  const handleMarkComplete = async () => {
    try {
      await tutorialService.updateProgress(parseInt(id), { progress: 100, status: 'completed' });
      setCompleted(true);
      setProgress(100);
      message.success('Tutorial marked as complete!');
    } catch (error) {
      message.error('Failed to mark tutorial as complete');
    }
  };

  const handleQuizComplete = async (result) => {
    try {
      await quizService.submitQuizAttempt(result.quizId, result.answers);
      message.success(`Quiz completed! Score: ${result.score}%`);
    } catch (error) {
      message.error('Failed to submit quiz result');
    }
  };

  const handleBack = () => {
    navigate('/tutorials');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Tutorial not found</Title>
        <Button type="primary" onClick={handleBack}>Back to Tutorials</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<LeftOutlined />} 
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Back to Tutorials
        </Button>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={2}>{tutorial.title}</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: 16 }}>
              {tutorial.description}
            </Paragraph>
            
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue" style={{ marginRight: 8 }}>{tutorial.category}</Tag>
              <Tag color={tutorial.difficulty === 'Beginner' ? 'green' : tutorial.difficulty === 'Intermediate' ? 'orange' : 'red'}>
                {tutorial.difficulty}
              </Tag>
              <Tag color="purple">{tutorial.duration}</Tag>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Rate disabled defaultValue={tutorial.rating} style={{ marginRight: 8 }} />
              <Text type="secondary">({tutorial.students} students enrolled)</Text>
            </div>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card>
              <Title level={4}>Your Progress</Title>
              <Progress 
                percent={progress} 
                status={completed ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                {completed ? (
                  <div>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                    <div>Completed!</div>
                  </div>
                ) : (
                  <div>
                    <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                    <div>In Progress</div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><PlayCircleOutlined />Video Lesson</span>} key="content">
            <div style={{ 
              height: 400, 
              background: videoPlaying ? '#000' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 8,
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={!videoPlaying ? handleStartVideo : undefined}
            >
              {videoPlaying ? (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', marginBottom: 16 }}>
                    🎥 Video Player (Simulated)
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    In a real app, this would be an actual video player
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Button 
                      type="primary" 
                      onClick={() => setVideoPlaying(false)}
                      style={{ marginRight: 8 }}
                    >
                      Pause Video
                    </Button>
                    <Button 
                      type="default" 
                      onClick={handleMarkComplete}
                      disabled={completed}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <div style={{ fontSize: '18px' }}>Click to Start Video</div>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane tab={<span><QuestionCircleOutlined />Quizzes</span>} key="quizzes">
            {quizzes.length > 0 ? (
              quizzes.map(quiz => (
                <Quiz 
                  key={quiz.id} 
                  quiz={quiz} 
                  onComplete={handleQuizComplete}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <QuestionCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>No quizzes available for this tutorial yet.</div>
              </div>
            )}
          </TabPane>

          <TabPane tab={<span><FileTextOutlined />Resources</span>} key="resources">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Learning Materials" extra={<DownloadOutlined />}>
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>📄 Course Notes (PDF)</Title>
              <Text type="secondary">Download the complete course notes and materials</Text>
              <br />
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
                style={{ marginTop: 8, marginRight: 8 }}
              >
                Download Notes
              </Button>
              {completed && (
                <Button 
                  type="default" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadCertificate}
                >
                  Download Certificate
                </Button>
              )}
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>📚 Additional Resources</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>Amharic Alphabet Chart</li>
                <li>Cultural Context Guide</li>
                <li>Practice Exercises</li>
                <li>Audio Pronunciation Guide</li>
              </ul>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Tutorial Information">
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>📋 What You'll Learn</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>Basic Amharic alphabet recognition</li>
                <li>Pronunciation techniques</li>
                <li>Writing practice methods</li>
                <li>Cultural significance of letters</li>
              </ul>
            </div>
            
            <Divider />
            
            <div>
              <Title level={5}>🎯 Learning Objectives</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>Identify all 33 Amharic letters</li>
                <li>Pronounce letters correctly</li>
                <li>Write basic letter forms</li>
                <li>Understand letter combinations</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TutorialDetail;
