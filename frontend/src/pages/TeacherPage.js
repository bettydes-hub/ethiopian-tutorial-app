import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Modal, Form, Input, Select, Upload, message, Tabs, Table, Tag, Space, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, FileTextOutlined, VideoCameraOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import { tutorialService } from '../api/tutorialApi';
import { quizService } from '../api/quizApi';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const TeacherPage = () => {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTutorialModalVisible, setIsTutorialModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [tutorialForm] = Form.useForm();
  const [quizForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('tutorials');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    video: null,
    pdf: null,
    thumbnail: null
  });

  // Fetch tutorials and quizzes from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutorialsData, quizzesData] = await Promise.all([
        tutorialService.getAllTutorials({ teacherId: user?.id }),
        quizService.getAllQuizzes({ teacherId: user?.id })
      ]);
      console.log('Tutorials loaded:', tutorialsData);
      console.log('Quizzes loaded:', quizzesData);
      setTutorials(tutorialsData);
      setQuizzes(quizzesData);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Upload functions
  const uploadVideo = async (file) => {
    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5500/api'}/tutorials/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        message.success('Video uploaded successfully');
        setUploadedFiles(prev => ({ ...prev, video: result.data.videoUrl }));
        return result.data.videoUrl;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      message.error('Failed to upload video');
      throw error;
    } finally {
      setUploadingVideo(false);
    }
  };

  const uploadPdf = async (file) => {
    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5500/api'}/tutorials/upload/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        message.success('PDF uploaded successfully');
        setUploadedFiles(prev => ({ ...prev, pdf: result.data.pdfUrl }));
        return result.data.pdfUrl;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      message.error('Failed to upload PDF');
      throw error;
    } finally {
      setUploadingPdf(false);
    }
  };

  const uploadThumbnail = async (file) => {
    try {
      setUploadingThumbnail(true);
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5500/api'}/tutorials/upload/thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        message.success('Thumbnail uploaded successfully');
        setUploadedFiles(prev => ({ ...prev, thumbnail: result.data.thumbnailUrl }));
        return result.data.thumbnailUrl;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      message.error('Failed to upload thumbnail');
      throw error;
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleCreateTutorial = () => {
    setEditingTutorial(null);
    tutorialForm.resetFields();
    setIsTutorialModalVisible(true);
  };

  const handleEditTutorial = (tutorial) => {
    setEditingTutorial(tutorial);
    tutorialForm.setFieldsValue(tutorial);
    setIsTutorialModalVisible(true);
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    quizForm.resetFields();
    // Initialize with default values
    setTimeout(() => {
      quizForm.setFieldsValue({
        title: '',
        description: '',
        timeLimit: 30,
        maxAttempts: 3,
        questions: [{
          question: '',
          type: 'multiple_choice',
          points: 1,
          options: ['', ''],
          correctAnswer: 0
        }]
      });
    }, 100);
    setIsQuizModalVisible(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    quizForm.setFieldsValue(quiz);
    setIsQuizModalVisible(true);
  };

  const handleTutorialSubmit = async (values) => {
    try {
      console.log('=== TUTORIAL CREATION DEBUG ===');
      console.log('Form values from Ant Design:', values);
      console.log('Uploaded files state:', uploadedFiles);
      console.log('Form field values:', {
        videoUrl: tutorialForm.getFieldValue('videoUrl'),
        pdfUrl: tutorialForm.getFieldValue('pdfUrl'),
        thumbnail: tutorialForm.getFieldValue('thumbnail')
      });
      
      // Ensure we have the uploaded file URLs
      const tutorialData = {
        ...values,
        videoUrl: values.videoUrl || uploadedFiles.video,
        pdfUrl: values.pdfUrl || uploadedFiles.pdf,
        thumbnail: values.thumbnail || uploadedFiles.thumbnail
      };
      
      console.log('Final tutorial data being sent:', tutorialData);
      
      if (editingTutorial) {
        await tutorialService.updateTutorial(editingTutorial.id, tutorialData);
        message.success('Tutorial updated successfully');
      } else {
        await tutorialService.createTutorial(tutorialData);
        message.success('Tutorial created successfully');
      }
      setIsTutorialModalVisible(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Tutorial creation error:', error);
      console.error('Error response:', error.response?.data);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid tutorial data';
        if (errorMessage.includes('title')) {
          message.error('❌ Please provide a valid tutorial title (2-100 characters)');
        } else if (errorMessage.includes('description')) {
          message.error('❌ Please provide a valid tutorial description (at least 10 characters)');
        } else if (errorMessage.includes('category')) {
          message.error('❌ Please select a valid category for the tutorial');
        } else if (errorMessage.includes('difficulty')) {
          message.error('❌ Please select a valid difficulty level (Beginner, Intermediate, or Advanced)');
        } else {
          message.error(`❌ ${errorMessage}. Please check your input and try again.`);
        }
      } else if (error.response?.status === 401) {
        message.error('❌ You are not authorized to create tutorials. Please log in as a teacher.');
      } else if (error.response?.status === 413) {
        message.error('❌ File too large. Please upload smaller files (max 10MB each).');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to save tutorial';
        message.error(`❌ ${errorMessage}. Please try again or contact support if the problem persists.`);
      }
    }
  };

  const handleQuizSubmit = async (values) => {
    try {
      console.log('Quiz form values:', values);
      console.log('Questions:', values.questions);
      values.questions?.forEach((q, i) => {
        console.log(`Question ${i}:`, q);
        console.log(`  correctAnswer:`, q.correctAnswer, typeof q.correctAnswer);
      });
      
      // Process questions to ensure options are properly formatted
      const processedQuestions = values.questions?.map(question => {
        const options = Array.isArray(question.options) ? question.options : [];
        const correctAnswer = Math.max(0, parseInt(question.correctAnswer) || 0);
        
        // Ensure correct answer index is within bounds
        const validCorrectAnswer = Math.min(correctAnswer, options.length - 1);
        
        return {
          ...question,
          options,
          correctAnswer: validCorrectAnswer,
          points: parseInt(question.points) || 1
        };
      }) || [];
      
      const quizData = {
        title: values.title,
        description: values.description,
        tutorialId: values.tutorialId,
        timeLimit: parseInt(values.timeLimit),
        maxAttempts: parseInt(values.maxAttempts),
        questions: processedQuestions,
        teacherId: user?.id
      };
      
      console.log('Processed quiz data:', quizData);
      console.log('Selected tutorialId:', values.tutorialId);
      console.log('Available tutorials:', tutorials.map(t => ({ id: t.id, title: t.title })));
      
      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz.id, quizData);
        message.success('Quiz updated successfully');
      } else {
        await quizService.createQuiz(quizData);
        message.success('Quiz created successfully');
      }
      setIsQuizModalVisible(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Quiz creation error:', error);
      console.error('Error response:', error.response?.data);
      
      // Provide specific error messages based on the error type
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid quiz data';
        if (errorMessage.includes('title')) {
          message.error('❌ Please provide a valid quiz title (2-100 characters)');
        } else if (errorMessage.includes('description')) {
          message.error('❌ Please provide a valid quiz description (at least 10 characters)');
        } else if (errorMessage.includes('tutorial')) {
          message.error('❌ Please select a valid tutorial for this quiz');
        } else if (errorMessage.includes('questions')) {
          message.error('❌ Please add at least one question to the quiz');
        } else if (errorMessage.includes('correctAnswer')) {
          message.error('❌ Please specify the correct answer for each question');
        } else if (errorMessage.includes('timeLimit')) {
          message.error('❌ Time limit must be between 1 and 120 minutes');
        } else {
          message.error(`❌ ${errorMessage}. Please check your input and try again.`);
        }
      } else if (error.response?.status === 401) {
        message.error('❌ You are not authorized to create quizzes. Please log in as a teacher.');
      } else if (error.response?.status === 404) {
        message.error('❌ Selected tutorial not found. Please select a different tutorial.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to save quiz';
        message.error(`❌ ${errorMessage}. Please try again or contact support if the problem persists.`);
      }
    }
  };

  const handleDeleteTutorial = async (tutorialId) => {
    try {
      await tutorialService.deleteTutorial(tutorialId);
      message.success('Tutorial deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      message.error('Failed to delete tutorial');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      message.success('Quiz deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      message.error('Failed to delete quiz');
    }
  };

  const handleToggleQuizPublish = async (quiz) => {
    try {
      await quizService.togglePublishStatus(quiz.id);
      message.success(`Quiz ${quiz.is_published ? 'unpublished' : 'published'} successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      message.error(`Failed to ${quiz.is_published ? 'unpublish' : 'publish'} quiz`);
    }
  };

  const tutorialColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => (
        <Tag color={difficulty === 'Beginner' ? 'green' : difficulty === 'Intermediate' ? 'orange' : 'red'}>
          {difficulty}
        </Tag>
      ),
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (isPublished) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'PUBLISHED' : 'DRAFT'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditTutorial(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteTutorial(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const quizColumns = [
    {
      title: 'Quiz Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tutorial',
      dataIndex: 'tutorial',
      key: 'tutorial',
      render: (tutorial) => {
        return tutorial ? tutorial.title : 'Unknown';
      },
    },
    {
      title: 'Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
    },
    {
      title: 'Attempts',
      dataIndex: 'total_attempts',
      key: 'total_attempts',
    },
    {
      title: 'Avg Score',
      dataIndex: 'average_score',
      key: 'average_score',
      render: (score) => score ? `${score}%` : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (isPublished) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'PUBLISHED' : 'DRAFT'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditQuiz(record)}>
            Edit
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleToggleQuizPublish(record)}
            style={{ color: record.is_published ? '#ff4d4f' : '#52c41a' }}
          >
            {record.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteQuiz(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Teacher Dashboard</Title>
      <Text type="secondary">Manage your tutorials, upload materials, and create quizzes</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={4}>Tutorials</Title>
              <Text type="secondary">{tutorials.length} Created</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <QuestionCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Quizzes</Title>
              <Text type="secondary">{quizzes.length} Created</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UserOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
              <Title level={4}>Total Students</Title>
              <Text type="secondary">{tutorials.reduce((sum, t) => sum + (t.students || 0), 0)}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tutorials" key="tutorials">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTutorial}>
                Create Tutorial
              </Button>
            </div>
            <Table
              columns={tutorialColumns}
              dataSource={tutorials}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Quizzes" key="quizzes">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateQuiz}>
                Create Quiz
              </Button>
            </div>
            <Table
              columns={quizColumns}
              dataSource={quizzes}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Tutorial Modal */}
      <Modal
        title={editingTutorial ? 'Edit Tutorial' : 'Create Tutorial'}
        open={isTutorialModalVisible}
        onCancel={() => setIsTutorialModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={tutorialForm} layout="vertical" onFinish={handleTutorialSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="📚 Tutorial Title"
                rules={[
                  { 
                    required: true, 
                    message: '📚 Tutorial title is required' 
                  },
                  { 
                    min: 5, 
                    message: '📚 Title must be at least 5 characters long' 
                  },
                  { 
                    max: 200, 
                    message: '📚 Title must be no more than 200 characters' 
                  },
                  {
                    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
                    message: '📚 Title can only contain letters, numbers, spaces, and basic punctuation'
                  }
                ]}
                hasFeedback
              >
                <Input 
                  placeholder="Enter a descriptive tutorial title (5-200 characters)" 
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="📂 Category"
                rules={[
                  { 
                    required: true, 
                    message: '📂 Please select a category' 
                  }
                ]}
                hasFeedback
              >
                <Select placeholder="Choose the tutorial category">
                  <Option value="Language">🗣️ Language - Amharic, Oromo, and other languages</Option>
                  <Option value="Culture">🎭 Culture - Traditions, customs, and social practices</Option>
                  <Option value="History">📚 History - Historical events and heritage</Option>
                  <Option value="Cooking">🍽️ Cooking - Traditional Ethiopian cuisine</Option>
                  <Option value="Music">🎵 Music - Traditional music and instruments</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="📝 Description"
            rules={[
              { 
                required: true, 
                message: '📝 Description is required' 
              },
              { 
                min: 10, 
                message: '📝 Description must be at least 10 characters long' 
              },
              { 
                max: 500, 
                message: '📝 Description must be no more than 500 characters' 
              }
            ]}
            hasFeedback
          >
            <TextArea 
              rows={3} 
              placeholder="Describe what students will learn in this tutorial (10-500 characters)" 
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="🎯 Difficulty Level"
                rules={[
                  { 
                    required: true, 
                    message: '🎯 Please select a difficulty level' 
                  }
                ]}
                hasFeedback
              >
                <Select placeholder="Choose the appropriate difficulty level">
                  <Option value="Beginner">🟢 Beginner - Basic concepts, easy to follow</Option>
                  <Option value="Intermediate">🟡 Intermediate - Some prior knowledge required</Option>
                  <Option value="Advanced">🔴 Advanced - Complex topics, expert level</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration"
                rules={[{ required: true, message: 'Please input duration!' }]}
              >
                <Input placeholder="e.g., 2h 30m" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Upload Materials</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="videoUrl"
                label="Video File"
                rules={[{ required: true, message: 'Please upload video file!' }]}
              >
                <Input
                  value={uploadedFiles.video || ''}
                  placeholder="Video URL will appear here after upload"
                  readOnly
                  suffix={
                <Upload
                  name="video"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          const videoUrl = await uploadVideo(file);
                          tutorialForm.setFieldsValue({ videoUrl });
                          setUploadedFiles(prev => ({ ...prev, video: videoUrl }));
                          console.log('Video URL set:', videoUrl);
                          return false; // Prevent default upload
                        } catch (error) {
                          console.error('Video upload error:', error);
                          return false;
                        }
                      }}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadingVideo}
                        disabled={uploadingVideo}
                        type={uploadedFiles.video ? 'primary' : 'default'}
                      >
                        {uploadingVideo ? 'Uploading...' : uploadedFiles.video ? 'Video Uploaded ✓' : 'Upload Video'}
                      </Button>
                </Upload>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pdfUrl"
                label="PDF Notes"
                rules={[{ required: true, message: 'Please upload PDF file!' }]}
              >
                <Input
                  value={uploadedFiles.pdf || ''}
                  placeholder="PDF URL will appear here after upload"
                  readOnly
                  suffix={
                <Upload
                  name="pdf"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          const pdfUrl = await uploadPdf(file);
                          tutorialForm.setFieldsValue({ pdfUrl });
                          setUploadedFiles(prev => ({ ...prev, pdf: pdfUrl }));
                          console.log('PDF URL set:', pdfUrl);
                          return false; // Prevent default upload
                        } catch (error) {
                          console.error('PDF upload error:', error);
                          return false;
                        }
                      }}
                    >
                      <Button 
                        icon={<FileTextOutlined />} 
                        loading={uploadingPdf}
                        disabled={uploadingPdf}
                        type={uploadedFiles.pdf ? 'primary' : 'default'}
                      >
                        {uploadingPdf ? 'Uploading...' : uploadedFiles.pdf ? 'PDF Uploaded ✓' : 'Upload PDF'}
                      </Button>
                    </Upload>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="thumbnail"
                label="Thumbnail Image"
              >
                <Input
                  value={uploadedFiles.thumbnail || ''}
                  placeholder="Thumbnail URL will appear here after upload"
                  readOnly
                  suffix={
                    <Upload
                      name="thumbnail"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          const thumbnailUrl = await uploadThumbnail(file);
                          tutorialForm.setFieldsValue({ thumbnail: thumbnailUrl });
                          setUploadedFiles(prev => ({ ...prev, thumbnail: thumbnailUrl }));
                          console.log('Thumbnail URL set:', thumbnailUrl);
                          return false; // Prevent default upload
                        } catch (error) {
                          console.error('Thumbnail upload error:', error);
                          return false;
                        }
                      }}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadingThumbnail}
                        disabled={uploadingThumbnail}
                        type={uploadedFiles.thumbnail ? 'primary' : 'default'}
                      >
                        {uploadingThumbnail ? 'Uploading...' : uploadedFiles.thumbnail ? 'Thumbnail Uploaded ✓' : 'Upload Thumbnail'}
                      </Button>
                </Upload>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingTutorial ? 'Update' : 'Create'} Tutorial
            </Button>
            <Button onClick={() => setIsTutorialModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
        open={isQuizModalVisible}
        onCancel={() => setIsQuizModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={quizForm} layout="vertical" onFinish={handleQuizSubmit}>
          <Form.Item
            name="title"
            label="📝 Quiz Title"
            rules={[
              { 
                required: true, 
                message: '📝 Quiz title is required' 
              },
              {
                min: 5,
                message: '📝 Title must be at least 5 characters long'
              },
              {
                max: 100,
                message: '📝 Title must be no more than 100 characters'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Enter a descriptive quiz title (5-100 characters)" showCount maxLength={100} />
          </Form.Item>

          <Form.Item
            name="tutorialId"
            label="📚 Related Tutorial"
            rules={[
              { 
                required: true, 
                message: '📚 Please select a tutorial for this quiz' 
              }
            ]}
            hasFeedback
          >
            <Select placeholder="Choose the tutorial this quiz belongs to">
              {tutorials.map(tutorial => (
                <Option key={tutorial.id} value={tutorial.id}>
                  {tutorial.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="📄 Quiz Description"
            rules={[
              { 
                required: true, 
                message: '📄 Quiz description is required' 
              },
              {
                min: 10,
                message: '📄 Description must be at least 10 characters long'
              },
              {
                max: 300,
                message: '📄 Description must be no more than 300 characters'
              }
            ]}
            hasFeedback
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Describe what this quiz covers (10-300 characters)" 
              showCount 
              maxLength={300}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="timeLimit"
                label="⏱️ Time Limit (minutes)"
                rules={[
                  { 
                    required: true, 
                    message: '⏱️ Time limit is required' 
                  },
                  {
                    type: 'number',
                    min: 1,
                    message: '⏱️ Time limit must be at least 1 minute'
                  },
                  {
                    type: 'number',
                    max: 120,
                    message: '⏱️ Time limit cannot exceed 120 minutes'
                  }
                ]}
                hasFeedback
              >
                <Input 
                  type="number" 
                  placeholder="30" 
                  min={1} 
                  max={120}
                  addonAfter="minutes"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxAttempts"
                label="🔄 Max Attempts"
                rules={[
                  { 
                    required: true, 
                    message: '🔄 Max attempts is required' 
                  },
                  {
                    type: 'number',
                    min: 1,
                    message: '🔄 Max attempts must be at least 1'
                  },
                  {
                    type: 'number',
                    max: 10,
                    message: '🔄 Max attempts cannot exceed 10'
                  }
                ]}
                hasFeedback
              >
                <Input 
                  type="number" 
                  placeholder="3" 
                  min={1} 
                  max={10}
                  addonAfter="attempts"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Quiz Questions</Divider>
          
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'question']}
                      label="Question"
                      rules={[{ required: true, message: 'Please input question!' }]}
                    >
                      <Input placeholder="Enter question" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="Question Type"
                      rules={[{ required: true, message: 'Please select type!' }]}
                    >
                      <Select placeholder="Select type">
                        <Option value="multiple_choice">Multiple Choice</Option>
                        <Option value="true_false">True/False</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'points']}
                      label="Points"
                      rules={[{ required: true, message: 'Please input points!' }]}
                    >
                      <Input type="number" placeholder="Points" />
                    </Form.Item>

                    <Form.List name={[name, 'options']}>
                      {(optionFields, { add: addOption, remove: removeOption }) => (
                        <>
                          {optionFields.map(({ key: optionKey, name: optionName, ...optionRestField }) => (
                            <div key={optionKey} style={{ display: 'flex', marginBottom: 8 }}>
                              <Form.Item
                                {...optionRestField}
                                name={[optionName]}
                                style={{ flex: 1, marginRight: 8 }}
                                rules={[{ required: true, message: 'Option is required!' }]}
                              >
                                <Input placeholder={`Option ${optionName + 1}`} />
                              </Form.Item>
                              {optionFields.length > 2 && (
                              <Button onClick={() => removeOption(optionName)}>Remove</Button>
                              )}
                            </div>
                          ))}
                          {optionFields.length < 6 && (
                          <Button type="dashed" onClick={() => addOption()} block>
                            Add Option
                          </Button>
                          )}
                        </>
                      )}
                    </Form.List>

                    <Form.Item
                      {...restField}
                      name={[name, 'correctAnswer']}
                      label="Correct Answer Index"
                      initialValue={0}
                      rules={[
                        { required: true, message: 'Please input correct answer index!' }
                      ]}
                    >
                      <Input 
                        type="number" 
                        placeholder="0, 1, 2, etc." 
                        min={0}
                        step={1}
                        defaultValue={0}
                      />
                      <div style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
                        Enter the index of the correct option (0 for first option, 1 for second, etc.)
                      </div>
                    </Form.Item>

                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove Question
                    </Button>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Question
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingQuiz ? 'Update' : 'Create'} Quiz
            </Button>
            <Button onClick={() => setIsQuizModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="default" 
              onClick={() => {
                const values = quizForm.getFieldsValue();
                console.log('Current form values:', values);
                console.log('Questions:', values.questions);
                if (values.questions) {
                  values.questions.forEach((q, i) => {
                    console.log(`Question ${i}:`, q);
                    console.log(`  correctAnswer:`, q.correctAnswer, typeof q.correctAnswer);
                  });
                }
              }}
              style={{ marginLeft: 8 }}
            >
              Debug Form
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherPage;