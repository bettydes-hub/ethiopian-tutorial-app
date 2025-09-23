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
      const tutorialData = await tutorialService.getTutorialById(id);
      setTutorial(tutorialData);
      
      // Fetch quizzes for this tutorial
      const quizzesData = await quizService.getQuizzesByTutorial(id);
      setQuizzes(quizzesData);
      
      // Fetch user progress for this tutorial
      if (user?.id) {
        try {
          const userProgress = await tutorialService.getTutorialProgress(id);
          if (userProgress) {
            setProgress(userProgress.progress_percentage || 0);
            setCompleted(userProgress.status === 'completed');
          }
        } catch (error) {
          // If no progress exists, that's fine - user hasn't started yet
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
    if (tutorial?.pdf_url) {
      // Download the actual uploaded PDF file
      const link = document.createElement('a');
      link.href = tutorial.pdf_url;
      link.download = `${tutorial.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course_materials.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Course materials downloaded successfully!');
    } else {
      // Fallback to generated PDF if no uploaded PDF
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
      await tutorialService.updateProgress(id, { progress: 100, status: 'completed' });
      setCompleted(true);
      setProgress(100);
      message.success('Tutorial marked as complete!');
    } catch (error) {
      message.error('Failed to mark tutorial as complete');
    }
  };

  const handleQuizComplete = async (result) => {
    try {
      // The quiz is already submitted by the Quiz component
      // This is just for handling the completion callback
      console.log('Quiz completed:', result);
      message.success(`Quiz completed! Score: ${result.score}%`);
    } catch (error) {
      console.error('Error in quiz completion handler:', error);
      message.error('Failed to handle quiz completion');
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
    <div className="main-container">
      {/* Header */}
      <div className="mb-24">
        <Button 
          icon={<LeftOutlined />} 
          onClick={handleBack}
          className="mb-16"
        >
          Back to Tutorials
        </Button>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={2}>{tutorial.title}</Title>
            <Paragraph style={{ fontSize: '16px' }} className="mb-16">
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
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'content',
              label: <span><PlayCircleOutlined />Video Lesson</span>,
              children: (
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
                tutorial?.video_url ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    <video 
                      controls 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onEnded={() => setVideoPlaying(false)}
                    >
                      <source src={tutorial.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
                      <Button 
                        type="default" 
                        onClick={handleMarkComplete}
                        disabled={completed}
                        style={{ background: 'rgba(0,0,0,0.7)', color: 'white', border: '1px solid white' }}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '18px', marginBottom: 16 }}>
                      🎥 Video Player (Simulated)
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      No video URL available for this tutorial
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <Button 
                        type="primary" 
                        onClick={() => setVideoPlaying(false)}
                        style={{ marginRight: 8 }}
                      >
                        Close
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
                )
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <div style={{ fontSize: '18px' }}>
                    {tutorial?.video_url ? 'Click to Start Video' : 'No Video Available'}
                  </div>
                  {tutorial?.video_url && (
                    <div style={{ fontSize: '14px', opacity: 0.8, marginTop: 8 }}>
                      Video: {tutorial.video_url.split('/').pop()}
                    </div>
                  )}
                </div>
              )}
            </div>
              )
            },
            {
              key: 'quizzes',
              label: <span><QuestionCircleOutlined />Quizzes</span>,
              children: (
                <>
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
                </>
              )
            },
            {
              key: 'resources',
              label: <span><FileTextOutlined />Resources</span>,
              children: (
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
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default TutorialDetail;
