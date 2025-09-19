import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Typography, Progress, message, Result, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Quiz = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let totalScore = 0;
    let correctAnswers = 0;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        totalScore += question.points;
        correctAnswers++;
      }
    });

    const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
    setScore(percentage);
    setIsSubmitted(true);
    setShowResults(true);
    
    message.success(`Quiz completed! Your score: ${percentage}%`);
    
    if (onComplete) {
      onComplete({
        quizId: quiz.id,
        score: percentage,
        totalPoints: totalScore,
        correctAnswers,
        totalQuestions: quiz.questions.length
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Very Good!';
    if (score >= 70) return 'Good!';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  if (showResults) {
    return (
      <Card style={{ textAlign: 'center', margin: '20px 0' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: getScoreColor(score) }} />}
          title={`Quiz Completed!`}
          subTitle={`Your Score: ${score}% (${getScoreMessage(score)})`}
          extra={[
            <Button type="primary" key="retake" onClick={() => {
              setCurrentQuestion(0);
              setAnswers({});
              setIsSubmitted(false);
              setShowResults(false);
              setScore(0);
              setTimeLeft(quiz.timeLimit || 0);
            }}>
              Retake Quiz
            </Button>,
            <Button key="close" onClick={() => onComplete && onComplete({ quizId: quiz.id, score, completed: true })}>
              Close
            </Button>
          ]}
        />
        
        <Divider />
        
        <Title level={4}>Quiz Review</Title>
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = userAnswer === question.correctAnswer;
          
          return (
            <Card key={question.id} size="small" style={{ marginBottom: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>Question {index + 1}:</Text>
                <Text style={{ marginLeft: 8 }}>{question.question}</Text>
                <div style={{ marginLeft: 'auto' }}>
                  {isCorrect ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                  )}
                </div>
              </div>
              
              <div style={{ marginLeft: 16 }}>
                {question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswer === optionIndex;
                  const isCorrectAnswer = question.correctAnswer === optionIndex;
                  
                  return (
                    <div
                      key={optionIndex}
                      style={{
                        padding: '4px 8px',
                        margin: '4px 0',
                        borderRadius: '4px',
                        backgroundColor: isCorrectAnswer ? '#f6ffed' : isUserAnswer && !isCorrect ? '#fff2f0' : '#fafafa',
                        border: isCorrectAnswer ? '1px solid #52c41a' : isUserAnswer && !isCorrect ? '1px solid #ff4d4f' : '1px solid #d9d9d9'
                      }}
                    >
                      <Text style={{ color: isCorrectAnswer ? '#52c41a' : isUserAnswer && !isCorrect ? '#ff4d4f' : '#000' }}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                        {isCorrectAnswer && ' ✓'}
                        {isUserAnswer && !isCorrect && ' (Your Answer)'}
                      </Text>
                    </div>
                  );
                })}
              </div>
              
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Points: {isCorrect ? question.points : 0} / {question.points}
              </Text>
            </Card>
          );
        })}
      </Card>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>{quiz.title}</Title>
        {timeLeft > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <Text strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
          </div>
        )}
      </div>

      <Progress
        percent={((currentQuestion + 1) / quiz.questions.length) * 100}
        showInfo={false}
        style={{ marginBottom: 24 }}
      />

      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={4}>Question {currentQuestion + 1} of {quiz.questions.length}</Title>
        <Text style={{ fontSize: '16px' }}>{question.question}</Text>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Points: {question.points}
        </Text>
      </Card>

      <div style={{ marginBottom: 24 }}>
        {question.type === 'multiple_choice' ? (
          <Radio.Group
            value={answers[question.id]}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.options.map((option, index) => (
                <Radio key={index} value={index} style={{ padding: '8px 0' }}>
                  {String.fromCharCode(65 + index)}. {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : question.type === 'true_false' ? (
          <Radio.Group
            value={answers[question.id]}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value={true} style={{ padding: '8px 0' }}>True</Radio>
              <Radio value={false} style={{ padding: '8px 0' }}>False</Radio>
            </Space>
          </Radio.Group>
        ) : (
          <Checkbox.Group
            value={answers[question.id] || []}
            onChange={(checkedValues) => handleAnswerChange(question.id, checkedValues)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.options.map((option, index) => (
                <Checkbox key={index} value={index} style={{ padding: '8px 0' }}>
                  {String.fromCharCode(65 + index)}. {option}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>
        
        <Space>
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button type="primary" onClick={handleSubmit} disabled={!answers[question.id]}>
              Submit Quiz
            </Button>
          ) : (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default Quiz;
