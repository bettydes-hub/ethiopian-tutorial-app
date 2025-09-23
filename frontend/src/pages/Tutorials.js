import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Select, Row, Col, Typography, Tag, Rate, Modal } from 'antd';
import { SearchOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { tutorialService } from '../api/tutorialApi';

const { Title, Text } = Typography;
const { Search } = Input;

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewModal, setPreviewModal] = useState({ visible: false, tutorial: null });

  const fetchTutorials = async () => {
    try {
      const data = await tutorialService.getAllTutorials();
      setTutorials(data);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTutorials = useCallback(() => {
    let filtered = tutorials;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchText.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.category === selectedCategory);
    }

    setFilteredTutorials(filtered);
  }, [tutorials, searchText, selectedCategory]);

  useEffect(() => {
    fetchTutorials();
  }, []);

  useEffect(() => {
    filterTutorials();
  }, [filterTutorials]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'orange';
      case 'Advanced': return 'red';
      default: return 'blue';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Language': 'blue',
      'Culture': 'purple',
      'History': 'brown',
      'Cooking': 'orange',
      'Music': 'pink',
    };
    return colors[category] || 'default';
  };

  const handlePreview = (tutorial) => {
    setPreviewModal({ visible: true, tutorial });
  };

  const handleStartTutorial = (tutorial) => {
    // Navigate to tutorial detail page
    window.location.href = `/tutorial/${tutorial.id}`;
  };


  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tutorials</Title>
      <Text type="secondary">Explore Ethiopian culture, language, and traditions</Text>

      {/* Search and Filters */}
      <Card style={{ marginTop: 24, marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search tutorials..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Language', label: 'Language' },
                { value: 'Culture', label: 'Culture' },
                { value: 'History', label: 'History' },
                { value: 'Cooking', label: 'Cooking' },
                { value: 'Music', label: 'Music' }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">
                Showing {filteredTutorials.length} of {tutorials.length} tutorials
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tutorials Display */}
      <Row gutter={[16, 16]}>
        {filteredTutorials.map((tutorial) => (
          <Col xs={24} sm={12} lg={8} key={tutorial.id}>
            <Card
              hoverable
              cover={
                <div style={{ 
                  height: 200, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => handlePreview(tutorial)}
                >
                  <PlayCircleOutlined style={{ fontSize: 48, color: 'white' }} />
                  <div style={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    <Text style={{ color: 'white' }}>{tutorial.duration}</Text>
                  </div>
                </div>
              }
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />} 
                  onClick={() => handlePreview(tutorial)}
                >
                  Preview
                </Button>,
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={() => handleStartTutorial(tutorial)}
                >
                  Start Learning
                </Button>
              ]}
            >
              <Card.Meta
                title={tutorial.title}
                description={
                  <div>
                    <Text ellipsis={{ rows: 2 }}>{tutorial.description}</Text>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Tag color={getCategoryColor(tutorial.category)}>{tutorial.category}</Tag>
                        <Tag color={getDifficultyColor(tutorial.difficulty)}>{tutorial.difficulty}</Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Rate disabled defaultValue={tutorial.rating || 4} style={{ fontSize: 14 }} />
                        <Text type="secondary" style={{ marginLeft: 4 }}>
                          ({tutorial.students || 0})
                        </Text>
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {filteredTutorials.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Text type="secondary">No tutorials found matching your criteria</Text>
        </div>
      )}

      {/* Video Preview Modal */}
      <Modal
        title={previewModal.tutorial?.title}
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, tutorial: null })}
        footer={[
          <Button key="close" onClick={() => setPreviewModal({ visible: false, tutorial: null })}>
            Close
          </Button>,
          <Button 
            key="start" 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => {
              handleStartTutorial(previewModal.tutorial);
              setPreviewModal({ visible: false, tutorial: null });
            }}
          >
            Start Tutorial
          </Button>
        ]}
        width={800}
      >
        {previewModal.tutorial && (
          <div>
            <div style={{ 
              height: 300, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 16,
              borderRadius: 8
            }}>
              <PlayCircleOutlined style={{ fontSize: 64, color: 'white' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>{previewModal.tutorial.description}</Text>
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Category:</Text>
                <br />
                <Tag color={getCategoryColor(previewModal.tutorial.category)}>
                  {previewModal.tutorial.category}
                </Tag>
              </Col>
              <Col span={8}>
                <Text strong>Difficulty:</Text>
                <br />
                <Tag color={getDifficultyColor(previewModal.tutorial.difficulty)}>
                  {previewModal.tutorial.difficulty}
                </Tag>
              </Col>
              <Col span={8}>
                <Text strong>Duration:</Text>
                <br />
                <Text>{previewModal.tutorial.duration}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tutorials;
