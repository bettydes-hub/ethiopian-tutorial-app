const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');
const { formatResponse, formatPaginatedResponse, calculatePagination } = require('../utils/helpers');

// Get quizzes by tutorial
const getQuizzesByTutorial = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    
    const quizzes = await Quiz.findAll({
      where: {
        tutorial_id: tutorialId,
        is_published: true
      },
      include: [
        {
          model: Question,
          as: 'questions',
          where: { is_active: true },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(
      formatResponse(true, { quizzes }, 'Quizzes retrieved successfully')
    );
  } catch (error) {
    console.error('Get quizzes by tutorial error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to retrieve quizzes')
    );
  }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      tutorialId, 
      teacherId,
      isPublished,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = {};
    
    if (tutorialId) {
      query.tutorial_id = tutorialId;
    }
    
    if (teacherId) {
      query.teacher_id = teacherId;
    }
    
    if (isPublished !== undefined) {
      query.is_published = isPublished === 'true';
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get quizzes with pagination
    const { count: total, rows: quizzes } = await Quiz.findAndCountAll({
      where: query,
      include: [
        {
          model: require('../models/Tutorial'),
          as: 'tutorial',
          attributes: ['id', 'title', 'description', 'category']
        },
        {
          model: require('../models/User'),
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    res.json(
      formatPaginatedResponse(quizzes, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get quizzes')
    );
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeAnswers = req.query.includeAnswers === 'true';
    
    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: require('../models/Tutorial'),
          as: 'tutorial',
          attributes: ['id', 'title', 'description', 'category']
        },
        {
          model: require('../models/User'),
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Get questions
    const questions = await Question.findAll({
      where: { quiz_id: id, is_active: true },
      order: [['order', 'ASC']]
    });
    
    // Remove correct answers if not requested
    if (!includeAnswers) {
      questions.forEach(question => {
        delete question.correct_answer;
      });
    }
    
    const quizData = {
      ...quiz.toJSON(),
      questions
    };
    
    res.json(
      formatResponse(true, { quiz: quizData }, 'Quiz retrieved successfully')
    );
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get quiz')
    );
  }
};

// Create quiz
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      tutorialId,
      timeLimit,
      passingScore,
      maxAttempts,
      showCorrectAnswers,
      showExplanations,
      randomizeQuestions,
      randomizeOptions,
      questions
    } = req.body;
    
    const teacherId = req.user.id;
    
    console.log('Quiz creation request:', {
      title,
      description,
      tutorialId,
      teacherId,
      timeLimit,
      maxAttempts
    });
    
    // Verify tutorial exists and user has access
    const Tutorial = require('../models/Tutorial');
    const tutorial = await Tutorial.findByPk(tutorialId);
    console.log('Tutorial found:', tutorial ? tutorial.title : 'NOT FOUND');
    
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    if (req.user.role !== 'admin' && tutorial.teacher_id.toString() !== teacherId.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only create quizzes for your own tutorials')
      );
    }
    
    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      tutorial_id: tutorialId,
      time_limit: timeLimit || 0,
      passing_score: passingScore || 60,
      max_attempts: maxAttempts || 0,
      show_correct_answers: showCorrectAnswers !== false,
      show_explanations: showExplanations !== false,
      randomize_questions: randomizeQuestions || false,
      randomize_options: randomizeOptions || false,
      teacher_id: teacherId,
      total_questions: questions ? questions.length : 0
    });
    
    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const questionData = {
        question_text: questions[i].question,
        type: questions[i].type,
        options: questions[i].options,
        correct_answer: questions[i].correctAnswer,
        points: questions[i].points || 10,
        is_active: questions[i].isActive !== false,
        quiz_id: quiz.id,
        order: i + 1
      };
      
      const question = await Question.create(questionData);
      createdQuestions.push(question.id);
    }
    
    // Update quiz with question count
    await quiz.update({ total_questions: createdQuestions.length });
    
    res.status(201).json(
      formatResponse(true, { quiz }, 'Quiz created successfully')
    );
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to create quiz')
    );
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can update this quiz
    if (req.user.role !== 'admin' && quiz.teacher_id.toString() !== req.user.id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only update your own quizzes')
      );
    }
    
    // Update quiz with field mapping
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'questions') {
        // Map camelCase to snake_case
        const fieldMap = {
          'isPublished': 'is_published',
          'timeLimit': 'time_limit',
          'passingScore': 'passing_score',
          'maxAttempts': 'max_attempts',
          'showCorrectAnswers': 'show_correct_answers',
          'showExplanations': 'show_explanations',
          'randomizeQuestions': 'randomize_questions',
          'randomizeOptions': 'randomize_options'
        };
        
        const dbField = fieldMap[key] || key;
        quiz[dbField] = updateData[key];
      }
    });
    
    // Update questions if provided
    if (updateData.questions) {
      // Delete existing questions
      await Question.destroy({ where: { quiz_id: id } });
      
      // Create new questions
      const createdQuestions = [];
      for (let i = 0; i < updateData.questions.length; i++) {
        const questionData = {
          ...updateData.questions[i],
          quiz_id: id,
          order: i + 1
        };
        
        const question = await Question.create(questionData);
        createdQuestions.push(question.id);
      }
      
      await quiz.update({ total_questions: createdQuestions.length });
    }
    
    res.json(
      formatResponse(true, { quiz }, 'Quiz updated successfully')
    );
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update quiz')
    );
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can delete this quiz
    if (req.user.role !== 'admin' && quiz.teacher_id.toString() !== req.user.id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only delete your own quizzes')
      );
    }
    
    // Delete related questions and attempts
    await Question.destroy({ where: { quiz_id: id } });
    await QuizAttempt.destroy({ where: { quiz_id: id } });
    
    await Quiz.destroy({ where: { id } });
    
    res.json(
      formatResponse(true, null, 'Quiz deleted successfully')
    );
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to delete quiz')
    );
  }
};

// Start quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if quiz is published
    if (!quiz.is_published) {
      return res.status(403).json(
        formatResponse(false, null, '', 'Quiz is not published')
      );
    }
    
    // Check if user can attempt quiz (basic check)
    // Note: More sophisticated attempt checking can be added here
    
    // Get questions for the attempt first
    const questions = await Question.findAll({
      where: { quiz_id: id },
      order: [['order', 'ASC']]
    });
    
    // Create new attempt
    const attempt = new QuizAttempt({
      user_id: userId,
      quiz_id: id,
      score: 0,
      total_questions: questions.length,
      correct_answers: 0,
      time_taken: 0,
      is_passed: false,
      status: 'in_progress',
      started_at: new Date(),
      completed_at: new Date()
    });
    
    await attempt.save();
    
    // Remove correct answers
    const questionsForAttempt = questions.map(q => {
      const questionObj = q.toJSON();
      delete questionObj.correct_answer;
      return questionObj;
    });
    
    res.json(
      formatResponse(true, { 
        attempt: attempt.toJSON(),
        questions: questionsForAttempt,
        timeLimit: quiz.timeLimit
      }, 'Quiz attempt started successfully')
    );
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to start quiz attempt')
    );
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;
    
    const attempt = await QuizAttempt.findByPk(id);
    if (!attempt) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz attempt not found')
      );
    }
    
    if (attempt.user_id.toString() !== userId.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only submit your own attempts')
      );
    }
    
    // Skip status check for now - allow submission regardless of status
    // TODO: Re-enable status check once we confirm the status values
    
    // Check if attempt is expired (simplified check)
    const now = new Date();
    const timeLimit = 30 * 60 * 1000; // 30 minutes in milliseconds
    if (now - new Date(attempt.started_at) > timeLimit) {
      attempt.status = 'timeout';
      attempt.completed_at = new Date();
      await attempt.save();
      
      return res.status(400).json(
        formatResponse(false, null, '', 'Quiz attempt has expired')
      );
    }
    
    // Get quiz and questions
    const quiz = await Quiz.findByPk(attempt.quiz_id);
    const questions = await Question.findAll({ 
      where: { 
        quiz_id: attempt.quiz_id,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });
    
    // Grade the quiz
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = [];
    
     for (const question of questions) {
       const userAnswer = answers[question.id.toString()];
       const isCorrect = userAnswer == question.correct_answer; // Use == for loose comparison
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      totalPoints += question.points;
      
      questionResults.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
        timeSpent: 0 // Could be calculated per question if needed
      });
    }
    
    // Update attempt
    attempt.answers = answers;
    attempt.time_taken = timeSpent || 0;
    attempt.correct_answers = questionResults.filter(r => r.isCorrect).length;
    const pointsEarned = questionResults.reduce((sum, result) => sum + (result.isCorrect ? result.points : 0), 0);
    attempt.score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    attempt.is_passed = attempt.score >= quiz.passing_score;
    attempt.status = 'completed';
    attempt.completed_at = new Date();
    
    await attempt.save();
    
    // Update progress if tutorial exists
    const Progress = require('../models/Progress');
    const progress = await Progress.findOne({
      where: {
        user_id: userId,
        tutorial_id: quiz.tutorial_id
      }
    });
    
    if (progress) {
      // Update progress with quiz attempt results
      progress.quiz_attempts = progress.quiz_attempts || [];
      progress.quiz_attempts.push({
        quiz_id: quiz.id,
        attemptId: attempt.id,
        score: attempt.score,
        isPassed: attempt.is_passed,
        completedAt: attempt.completed_at
      });
      await progress.save();
    }
    
    res.json(
      formatResponse(true, { 
        attempt: attempt.toJSON(),
        score: attempt.score,
        isPassed: attempt.is_passed
      }, 'Quiz submitted successfully')
    );
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to submit quiz attempt')
    );
  }
};

// Get quiz attempts
const getQuizAttempts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const pagination = calculatePagination(page, limit);
    
    const { count: total, rows: attempts } = await QuizAttempt.findAndCountAll({
      where: { quiz_id: id },
      include: [
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['completedAt', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    res.json(
      formatPaginatedResponse(attempts, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get quiz attempts')
    );
  }
};

// Get user quiz attempts
const getUserQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, quizId } = req.query;
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = { user_id: userId };
    if (quizId) {
      query.quiz_id = quizId;
    }
    
    const { count: total, rows: attempts } = await QuizAttempt.findAndCountAll({
      where: query,
      include: [
        {
          model: require('../models/Quiz'),
          as: 'quiz',
          attributes: ['id', 'title', 'tutorialId'],
          include: [
            {
              model: require('../models/Tutorial'),
              as: 'tutorial',
              attributes: ['id', 'title', 'category']
            }
          ]
        }
      ],
      order: [['completedAt', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    res.json(
      formatPaginatedResponse(attempts, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get user quiz attempts error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get user quiz attempts')
    );
  }
};

// Publish/Unpublish quiz
const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can publish this quiz
    if (req.user.role !== 'admin' && quiz.teacher_id.toString() !== req.user.id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only publish your own quizzes')
      );
    }
    
    quiz.is_published = !quiz.is_published;
    await quiz.save();
    
    res.json(
      formatResponse(true, { quiz }, `Quiz ${quiz.is_published ? 'published' : 'unpublished'} successfully`)
    );
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update publish status')
    );
  }
};

module.exports = {
  getQuizzesByTutorial,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttempts,
  getUserQuizAttempts,
  togglePublishStatus
};
