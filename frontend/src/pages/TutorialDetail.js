import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Progress, Typography, Row, Col, Tag, Rate, Divider, message, Spin, Tabs, Input, List, Avatar } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, LeftOutlined, CheckCircleOutlined, ClockCircleOutlined, QuestionCircleOutlined, FileTextOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorialService } from '../api/tutorialApi';
import { quizService } from '../api/quizApi';
import { reviewService } from '../api/reviewApi';
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
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [quickRating, setQuickRating] = useState(0);
  const [submittingQuickRating, setSubmittingQuickRating] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);

  const fetchTutorial = useCallback(async () => {
    try {
      const tutorialData = await tutorialService.getTutorialById(id);
      setTutorial(tutorialData);
      
      // Fetch quizzes for this tutorial
      const quizzesData = await quizService.getQuizzesByTutorial(id);
      setQuizzes(quizzesData);
      
      // Fetch reviews for this tutorial
      try {
        const reviewsData = await reviewService.getTutorialReviews(id);
        console.log('🔍 Fetched reviews data:', reviewsData);
        console.log('🔍 Reviews data type:', typeof reviewsData);
        console.log('🔍 Reviews data keys:', Object.keys(reviewsData || {}));
        console.log('🔍 Reviews array:', reviewsData.reviews || []);
        console.log('🔍 Reviews array type:', typeof (reviewsData.reviews || []));
        console.log('🔍 Reviews array length:', (reviewsData.reviews || []).length);
        setReviews(reviewsData.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
      
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

        // Check if user has already rated this tutorial
        try {
          const userReview = await reviewService.getUserReview(id);
          if (userReview) {
            setUserHasRated(true);
            setQuickRating(userReview.rating);
          }
        } catch (error) {
          console.log('User has not rated this tutorial yet');
          setUserHasRated(false);
          setQuickRating(0);
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

  const handleQuickRating = async (rating) => {
    if (!user?.id) {
      message.warning('Please log in to rate this tutorial');
      return;
    }

    try {
      setSubmittingQuickRating(true);
      
      // Submit rating using the review API (creates a proper review)
      const reviewData = await reviewService.createReview(id, {
        rating: rating,
        comment: `Quick rating: ${rating} stars`
      });
      
      console.log('🔍 Review created successfully:', reviewData);
      
      message.success(`Thanks for rating this tutorial ${rating} stars!`);
      
      // Set user has rated and update quick rating
      setUserHasRated(true);
      setQuickRating(rating);
      
      // Add the new review to the reviews list
      const newReview = {
        id: reviewData.review.id,
        user: reviewData.review.user,
        rating: reviewData.review.rating,
        text: reviewData.review.comment,
        date: reviewData.review.created_at
      };
      
      console.log('🔍 Adding new review to state:', newReview);
      setReviews(prev => {
        const updated = [newReview, ...prev];
        console.log('🔍 Updated reviews state:', updated);
        return updated;
      });
      
      // Refresh tutorial data to get updated rating
      fetchTutorial();
    } catch (error) {
      console.error('Error submitting quick rating:', error);
      
      if (error.response?.status === 401) {
        message.error('Please log in to rate this tutorial.');
      } else if (error.response?.status === 409) {
        message.error('You have already rated this tutorial.');
      } else {
        message.error('Failed to submit rating. Please try again.');
      }
    } finally {
      setSubmittingQuickRating(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      message.warning('Please select a rating before submitting your review');
      return;
    }

    if (!reviewText.trim()) {
      message.warning('Please write a review before submitting');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Submit review using the review API
      const reviewData = await reviewService.createReview(id, {
        rating: userRating,
        comment: reviewText
      });
      
      // Add review to local state
      const newReview = {
        id: reviewData.review.id,
        user: reviewData.review.user,
        rating: reviewData.review.rating,
        text: reviewData.review.comment,
        date: reviewData.review.created_at
      };
      
      setReviews(prev => [newReview, ...prev]);
      setUserRating(0);
      setReviewText('');
      
      message.success('Thank you for your review!');
      
      // Refresh tutorial data to get updated rating
      fetchTutorial();
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 409) {
        message.error('You have already reviewed this tutorial.');
      } else if (error.response?.status === 401) {
        message.error('Please log in to submit a review.');
      } else {
        message.error('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
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
              {user?.id && (
                <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                  <Text type="secondary" style={{ marginRight: 8 }}>
                    {userHasRated ? 'You rated:' : 'Rate:'}
                  </Text>
                  <Rate 
                    value={quickRating}
                    onChange={handleQuickRating}
                    disabled={submittingQuickRating || userHasRated}
                    style={{ fontSize: 16 }}
                  />
                  {submittingQuickRating && <Text type="secondary" style={{ marginLeft: 8 }}>Submitting...</Text>}
                  {userHasRated && <Text type="success" style={{ marginLeft: 8 }}>✓</Text>}
                </div>
              )}
              
              <Text type="secondary" style={{ marginLeft: user?.id ? 'auto' : 0 }}>
                ({tutorial.students} students enrolled)
              </Text>
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
            },
            {
              key: 'reviews',
              label: <span><StarOutlined />Reviews</span>,
              children: (
                <div>
                  {/* Submit Review Section */}
                  <Card title="Write a Review" style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Rate this tutorial:</Text>
                      <Rate 
                        value={userRating} 
                        onChange={setUserRating}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Write your review:</Text>
                      <Input.TextArea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this tutorial..."
                        rows={4}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                    
                    <Button 
                      type="primary" 
                      onClick={handleSubmitReview}
                      loading={submittingReview}
                      disabled={!userRating || !reviewText.trim()}
                    >
                      Submit Review
                    </Button>
                  </Card>

                  {/* Reviews List */}
                  {console.log('🔍 Rendering reviews, count:', reviews.length, 'reviews:', reviews)}
                  {console.log('🔍 First review details:', reviews[0])}
                  {console.log('🔍 First review keys:', reviews[0] ? Object.keys(reviews[0]) : 'No reviews')}
                  <Card title={`Reviews (${reviews.length})`}>
                    {reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        <StarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <div>No reviews yet. Be the first to review this tutorial!</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reviews.map((review, index) => {
                          console.log(`🔍 Rendering review ${index}:`, review);
                          console.log(`🔍 Review rating:`, review.rating, 'type:', typeof review.rating);
                          console.log(`🔍 Review user:`, review.user);
                          console.log(`🔍 Review comment:`, review.comment);
                          
                          // Fix date formatting
                          const formatDate = (dateString) => {
                            if (!dateString) return 'No date';
                            try {
                              const date = new Date(dateString);
                              if (isNaN(date.getTime())) return 'Invalid date';
                              return date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            } catch (error) {
                              return 'Invalid date';
                            }
                          };

                          return (
                            <div key={index} style={{ 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              gap: '12px',
                              padding: '16px',
                              border: '1px solid #f0f0f0',
                              borderRadius: '8px',
                              backgroundColor: '#fafafa'
                            }}>
                              <Avatar icon={<UserOutlined />} />
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '12px',
                                  marginBottom: '8px',
                                  flexWrap: 'wrap'
                                }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                    {review.user?.name || 'Anonymous'}
                                  </span>
                                  <Rate 
                                    disabled 
                                    value={review.rating || 0} 
                                    style={{ fontSize: 14 }} 
                                  />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {formatDate(review.date || review.created_at)}
                                  </Text>
                                </div>
                                <div style={{ 
                                  color: '#333',
                                  lineHeight: '1.5',
                                  fontSize: '14px'
                                }}>
                                  {review.text || review.comment || 'No comment'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default TutorialDetail;
