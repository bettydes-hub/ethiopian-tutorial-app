import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Modal, Form, Input, Select, Upload, message, Tabs, Table, Tag, Space, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, FileTextOutlined, VideoCameraOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const TeacherPage = () => {
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

  // Mock data for tutorials and quizzes
  useEffect(() => {
    const mockTutorials = [
      {
        id: 1,
        title: 'Amharic Language Basics',
        description: 'Introduction to Amharic alphabet and basic phrases',
        category: 'Language',
        difficulty: 'Beginner',
        duration: '2h 30m',
        videoFile: 'amharic_basics.mp4',
        pdfFile: 'amharic_notes.pdf',
        students: 25,
        status: 'published'
      },
      {
        id: 2,
        title: 'Ethiopian Coffee Ceremony',
        description: 'Learn the traditional coffee ceremony process',
        category: 'Culture',
        difficulty: 'Intermediate',
        duration: '1h 15m',
        videoFile: 'coffee_ceremony.mp4',
        pdfFile: 'coffee_guide.pdf',
        students: 18,
        status: 'draft'
      }
    ];

    const mockQuizzes = [
      {
        id: 1,
        title: 'Amharic Basics Quiz',
        tutorialId: 1,
        questions: [
          {
            id: 1,
            question: 'What is the first letter of the Amharic alphabet?',
            type: 'multiple_choice',
            options: ['ሀ', 'ለ', 'መ', 'ሰ'],
            correctAnswer: 0,
            points: 10
          },
          {
            id: 2,
            question: 'How do you say "Hello" in Amharic?',
            type: 'multiple_choice',
            options: ['ሰላም', 'ታዲያስ', 'እንደምን', 'አመሰግናለሁ'],
            correctAnswer: 0,
            points: 10
          }
        ],
        totalPoints: 20,
        attempts: 15,
        averageScore: 75
      }
    ];

    setTutorials(mockTutorials);
    setQuizzes(mockQuizzes);
    setLoading(false);
  }, []);

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
    setIsQuizModalVisible(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    quizForm.setFieldsValue(quiz);
    setIsQuizModalVisible(true);
  };

  const handleTutorialSubmit = async (values) => {
    try {
      if (editingTutorial) {
        setTutorials(tutorials.map(t => t.id === editingTutorial.id ? { ...t, ...values } : t));
        message.success('Tutorial updated successfully');
      } else {
        const newTutorial = { id: Date.now(), ...values, students: 0, status: 'draft' };
        setTutorials([...tutorials, newTutorial]);
        message.success('Tutorial created successfully');
      }
      setIsTutorialModalVisible(false);
    } catch (error) {
      message.error('Failed to save tutorial');
    }
  };

  const handleQuizSubmit = async (values) => {
    try {
      if (editingQuiz) {
        setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, ...values } : q));
        message.success('Quiz updated successfully');
      } else {
        const newQuiz = { id: Date.now(), ...values, attempts: 0, averageScore: 0 };
        setQuizzes([...quizzes, newQuiz]);
        message.success('Quiz created successfully');
      }
      setIsQuizModalVisible(false);
    } catch (error) {
      message.error('Failed to save quiz');
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
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status.toUpperCase()}
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
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
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
      dataIndex: 'tutorialId',
      key: 'tutorialId',
      render: (tutorialId) => {
        const tutorial = tutorials.find(t => t.id === tutorialId);
        return tutorial ? tutorial.title : 'Unknown';
      },
    },
    {
      title: 'Questions',
      dataIndex: 'questions',
      key: 'questions',
      render: (questions) => questions.length,
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
    },
    {
      title: 'Attempts',
      dataIndex: 'attempts',
      key: 'attempts',
    },
    {
      title: 'Avg Score',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => `${score}%`,
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
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
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
              <Text type="secondary">{tutorials.reduce((sum, t) => sum + t.students, 0)}</Text>
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
                label="Tutorial Title"
                rules={[{ required: true, message: 'Please input tutorial title!' }]}
              >
                <Input placeholder="Enter tutorial title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category!' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Language">Language</Option>
                  <Option value="Culture">Culture</Option>
                  <Option value="History">History</Option>
                  <Option value="Cooking">Cooking</Option>
                  <Option value="Music">Music</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <TextArea rows={3} placeholder="Enter tutorial description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="Difficulty"
                rules={[{ required: true, message: 'Please select difficulty!' }]}
              >
                <Select placeholder="Select difficulty">
                  <Option value="Beginner">Beginner</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Advanced">Advanced</Option>
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
                name="videoFile"
                label="Video File"
                rules={[{ required: true, message: 'Please upload video file!' }]}
              >
                <Upload
                  name="video"
                  listType="text"
                  beforeUpload={() => false}
                  onChange={(info) => {
                    if (info.file) {
                      tutorialForm.setFieldsValue({ videoFile: info.file.name });
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Video</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pdfFile"
                label="PDF Notes"
                rules={[{ required: true, message: 'Please upload PDF file!' }]}
              >
                <Upload
                  name="pdf"
                  listType="text"
                  beforeUpload={() => false}
                  onChange={(info) => {
                    if (info.file) {
                      tutorialForm.setFieldsValue({ pdfFile: info.file.name });
                    }
                  }}
                >
                  <Button icon={<FileTextOutlined />}>Upload PDF</Button>
                </Upload>
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
            label="Quiz Title"
            rules={[{ required: true, message: 'Please input quiz title!' }]}
          >
            <Input placeholder="Enter quiz title" />
          </Form.Item>

          <Form.Item
            name="tutorialId"
            label="Related Tutorial"
            rules={[{ required: true, message: 'Please select tutorial!' }]}
          >
            <Select placeholder="Select tutorial">
              {tutorials.map(tutorial => (
                <Option key={tutorial.id} value={tutorial.id}>
                  {tutorial.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
                              >
                                <Input placeholder="Option" />
                              </Form.Item>
                              <Button onClick={() => removeOption(optionName)}>Remove</Button>
                            </div>
                          ))}
                          <Button type="dashed" onClick={() => addOption()} block>
                            Add Option
                          </Button>
                        </>
                      )}
                    </Form.List>

                    <Form.Item
                      {...restField}
                      name={[name, 'correctAnswer']}
                      label="Correct Answer Index"
                      rules={[{ required: true, message: 'Please input correct answer index!' }]}
                    >
                      <Input type="number" placeholder="0, 1, 2, etc." />
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
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherPage;