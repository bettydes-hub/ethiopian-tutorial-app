const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');
const { formatResponse, formatPaginatedResponse, calculatePagination } = require('../utils/helpers');

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
      query.tutorialId = tutorialId;
    }
    
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get quizzes with pagination
    const quizzes = await Quiz.find(query)
      .populate('tutorialId', 'title description category')
      .populate('teacherId', 'name email')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Quiz.countDocuments(query);
    
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
    
    const quiz = await Quiz.findById(id)
      .populate('tutorialId', 'title description category')
      .populate('teacherId', 'name email');
    
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Get questions
    const questions = await quiz.getOrderedQuestions();
    
    // Remove correct answers if not requested
    if (!includeAnswers) {
      questions.forEach(question => {
        delete question.correctAnswer;
      });
    }
    
    const quizData = {
      ...quiz.toObject(),
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
    
    const teacherId = req.user._id;
    
    // Verify tutorial exists and user has access
    const Tutorial = require('../models/Tutorial');
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    if (req.user.role !== 'admin' && tutorial.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only create quizzes for your own tutorials')
      );
    }
    
    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      tutorialId,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 60,
      maxAttempts: maxAttempts || 0,
      showCorrectAnswers: showCorrectAnswers !== false,
      showExplanations: showExplanations !== false,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions: randomizeOptions || false,
      teacherId
    });
    
    await quiz.save();
    
    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const questionData = {
        ...questions[i],
        quizId: quiz._id,
        order: i + 1
      };
      
      const question = new Question(questionData);
      await question.save();
      createdQuestions.push(question._id);
    }
    
    // Update quiz with question IDs
    quiz.questions = createdQuestions;
    await quiz.save();
    
    // Calculate total points
    await quiz.calculateTotalPoints();
    
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
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can update this quiz
    if (req.user.role !== 'admin' && quiz.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only update your own quizzes')
      );
    }
    
    // Update quiz
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'questions') {
        quiz[key] = updateData[key];
      }
    });
    
    // Update questions if provided
    if (updateData.questions) {
      // Delete existing questions
      await Question.deleteMany({ quizId: id });
      
      // Create new questions
      const createdQuestions = [];
      for (let i = 0; i < updateData.questions.length; i++) {
        const questionData = {
          ...updateData.questions[i],
          quizId: id,
          order: i + 1
        };
        
        const question = new Question(questionData);
        await question.save();
        createdQuestions.push(question._id);
      }
      
      quiz.questions = createdQuestions;
    }
    
    await quiz.save();
    
    // Recalculate total points
    await quiz.calculateTotalPoints();
    
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
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can delete this quiz
    if (req.user.role !== 'admin' && quiz.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only delete your own quizzes')
      );
    }
    
    // Delete related questions and attempts
    await Question.deleteMany({ quizId: id });
    await QuizAttempt.deleteMany({ quizId: id });
    
    await Quiz.findByIdAndDelete(id);
    
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
    const userId = req.user._id;
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if quiz is published
    if (!quiz.isPublished) {
      return res.status(403).json(
        formatResponse(false, null, '', 'Quiz is not published')
      );
    }
    
    // Check if user can attempt quiz
    const canAttempt = await quiz.canAttempt(userId);
    if (!canAttempt) {
      return res.status(403).json(
        formatResponse(false, null, '', 'Maximum attempts exceeded')
      );
    }
    
    // Create new attempt
    const attempt = new QuizAttempt({
      userId,
      quizId: id,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore
    });
    
    await attempt.save();
    
    // Get questions for the attempt
    const questions = await quiz.getOrderedQuestions();
    
    // Remove correct answers
    const questionsForAttempt = questions.map(q => {
      const questionObj = q.toObject();
      delete questionObj.correctAnswer;
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
    const userId = req.user._id;
    
    const attempt = await QuizAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz attempt not found')
      );
    }
    
    if (attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only submit your own attempts')
      );
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json(
        formatResponse(false, null, '', 'Quiz attempt is not in progress')
      );
    }
    
    // Check if attempt is expired
    if (attempt.isExpired()) {
      attempt.status = 'timeout';
      attempt.completedAt = new Date();
      await attempt.save();
      
      return res.status(400).json(
        formatResponse(false, null, '', 'Quiz attempt has expired')
      );
    }
    
    // Get quiz and questions
    const quiz = await Quiz.findById(attempt.quizId);
    const questions = await Question.find({ 
      _id: { $in: quiz.questions },
      isActive: true 
    });
    
    // Grade the quiz
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = [];
    
    for (const question of questions) {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      totalPoints += question.points;
      
      questionResults.push({
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
        timeSpent: 0 // Could be calculated per question if needed
      });
    }
    
    // Update attempt
    attempt.answers = answers;
    attempt.timeSpent = timeSpent || 0;
    attempt.questionResults = questionResults;
    attempt.totalPoints = totalPoints;
    attempt.pointsEarned = questionResults.reduce((sum, result) => sum + result.pointsEarned, 0);
    attempt.score = totalPoints > 0 ? Math.round((attempt.pointsEarned / totalPoints) * 100) : 0;
    attempt.isPassed = attempt.score >= attempt.passingScore;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    
    await attempt.save();
    
    // Update progress if tutorial exists
    const Progress = require('../models/Progress');
    const progress = await Progress.findOne({
      userId,
      tutorialId: quiz.tutorialId
    });
    
    if (progress) {
      await progress.addQuizAttempt(quiz._id, attempt._id, attempt.score, attempt.isPassed);
    }
    
    res.json(
      formatResponse(true, { 
        attempt: attempt.toJSON(),
        score: attempt.score,
        isPassed: attempt.isPassed
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
    
    const attempts = await QuizAttempt.find({ quizId: id })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await QuizAttempt.countDocuments({ quizId: id });
    
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
    const query = { userId };
    if (quizId) {
      query.quizId = quizId;
    }
    
    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title tutorialId')
      .populate('quizId.tutorialId', 'title category')
      .sort({ completedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await QuizAttempt.countDocuments(query);
    
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
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Quiz not found')
      );
    }
    
    // Check if user can publish this quiz
    if (req.user.role !== 'admin' && quiz.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only publish your own quizzes')
      );
    }
    
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    
    res.json(
      formatResponse(true, { quiz }, `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`)
    );
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update publish status')
    );
  }
};

module.exports = {
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
