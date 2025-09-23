import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Typography, Progress, message, Result, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { quizService } from '../api/quizApi';

const { Title, Text } = Typography;

const Quiz = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Debug logging
  console.log('Quiz component state:', {
    quizStarted,
    showResults,
    isSubmitted,
    score,
    attemptId,
    timeLeft
  });

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && quizStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && quizStarted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, quizStarted]);

  const startQuizAttempt = async () => {
    try {
      setIsLoading(true);
      const response = await quizService.startQuizAttempt(quiz.id);
      setAttemptId(response.attemptId);
      setQuizStarted(true);
      message.success('🎉 Quiz started! Good luck!');
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        message.error('❌ You need to be logged in to take this quiz. Please log in and try again.');
      } else if (error.response?.status === 404) {
        message.error('❌ Quiz not found. This quiz may have been deleted or is no longer available.');
      } else if (error.response?.status === 403) {
        message.error('❌ You are not authorized to take this quiz. Please contact your teacher.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        message.error('❌ Failed to start quiz. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    if (!attemptId) {
      message.error('❌ Please start the quiz first before submitting');
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter((_, index) => !answers[quiz.questions[index].id]);
    if (unansweredQuestions.length > 0) {
      message.warning(`⚠️ You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`);
    }

    try {
      setIsLoading(true);
      
      // Submit to backend
      const response = await quizService.submitQuizAttempt(attemptId, answers);
      
      setScore(response.score || 0);
      setIsSubmitted(true);
      setShowResults(true);
      
      // Show success message based on score
      const scorePercentage = response.score || 0;
      if (scorePercentage >= 80) {
        message.success(`🎉 Excellent! You scored ${scorePercentage}%!`);
      } else if (scorePercentage >= 60) {
        message.success(`👍 Good job! You scored ${scorePercentage}%!`);
      } else {
        message.info(`📚 You scored ${scorePercentage}%. Keep studying to improve!`);
      }
      
      if (onComplete) {
        onComplete({
          quizId: quiz.id,
          attemptId: attemptId,
          score: response.score || 0,
          totalPoints: response.totalPoints || 0,
          correctAnswers: response.correctAnswers || 0,
          totalQuestions: quiz.questions.length
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // Provide specific error messages
      if (error.response?.status === 400) {
        message.error('❌ Invalid quiz submission. Please check your answers and try again.');
      } else if (error.response?.status === 401) {
        message.error('❌ Session expired. Please log in again and retake the quiz.');
      } else if (error.response?.status === 404) {
        message.error('❌ Quiz attempt not found. Please start the quiz again.');
      } else if (error.response?.status === 409) {
        message.error('❌ Quiz already submitted. You cannot submit again.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error('❌ Network error. Please check your internet connection and try again.');
      } else {
        message.error('❌ Failed to submit quiz. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsLoading(false);
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

  if (!quizStarted) {
    return (
      <Card style={{ textAlign: 'center', margin: '20px 0' }}>
        <Title level={3}>{quiz.title}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          {quiz.description}
        </Text>
        <Space direction="vertical" size="large">
          <div>
            <Text strong>Time Limit: {quiz.timeLimit || 30} minutes</Text>
            <br />
            <Text strong>Questions: {quiz.questions?.length || 0}</Text>
          </div>
          <Button 
            type="primary" 
            size="large" 
            loading={isLoading}
            onClick={startQuizAttempt}
          >
            Start Quiz
          </Button>
        </Space>
      </Card>
    );
  }

  if (showResults && quizStarted) {
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
              setTimeLeft(quiz.timeLimit || 30);
              setQuizStarted(false);
              setAttemptId(null);
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

  // Fallback: if somehow we're in a weird state, show start quiz
  if (!quizStarted) {
    return (
      <Card className="quiz-container text-center">
        <Title level={3}>{quiz.title}</Title>
        <Text type="secondary" className="mb-16" style={{ display: 'block' }}>
          {quiz.description}
        </Text>
        <Space direction="vertical" size="large">
          <div>
            <Text strong>Time Limit: {quiz.timeLimit || 30} minutes</Text>
            <br />
            <Text strong>Questions: {quiz.questions?.length || 0}</Text>
          </div>
          <Button 
            type="primary" 
            size="large" 
            loading={isLoading}
            onClick={startQuizAttempt}
          >
            Start Quiz
          </Button>
        </Space>
      </Card>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <Card className="quiz-container">
      <div className="mb-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        className="mb-24"
      />

      <Card size="small" className="mb-24">
        <Title level={4}>Question {currentQuestion + 1} of {quiz.questions.length}</Title>
        <Text className="quiz-question">{question.question}</Text>
        <Text type="secondary" className="mt-16" style={{ display: 'block' }}>
          Points: {question.points}
        </Text>
      </Card>

      <div className="mb-24">
        {question.type === 'multiple_choice' ? (
          <Radio.Group
            value={answers[question.id]}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.options.map((option, index) => (
                <Radio key={index} value={index} className="quiz-option">
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
              <Radio value={true} className="quiz-option">True</Radio>
              <Radio value={false} className="quiz-option">False</Radio>
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
