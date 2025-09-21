const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Points earned cannot be negative']
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Total points cannot be negative']
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Time spent cannot be negative']
  },
  timeLimit: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'timeout'],
    default: 'in_progress'
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  passingScore: {
    type: Number,
    default: 60
  },
  questionResults: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    timeSpent: Number // time spent on this specific question
  }]
}, {
  timestamps: true
});

// Index for better query performance
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ quizId: 1, status: 1 });
quizAttemptSchema.index({ completedAt: -1 });

// Calculate score and points
quizAttemptSchema.methods.calculateScore = async function() {
  const Question = mongoose.model('Question');
  const Quiz = mongoose.model('Quiz');
  
  const quiz = await Quiz.findById(this.quizId);
  if (!quiz) throw new Error('Quiz not found');
  
  let totalPoints = 0;
  let earnedPoints = 0;
  
  for (const result of this.questionResults) {
    const question = await Question.findById(result.questionId);
    if (!question) continue;
    
    totalPoints += question.points;
    
    if (result.isCorrect) {
      earnedPoints += question.points;
    }
  }
  
  this.totalPoints = totalPoints;
  this.pointsEarned = earnedPoints;
  this.score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  this.isPassed = this.score >= this.passingScore;
  
  return this.save({ validateBeforeSave: false });
};

// Complete the attempt
quizAttemptSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Abandon the attempt
quizAttemptSchema.methods.abandon = function() {
  this.status = 'abandoned';
  this.completedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Check if attempt is expired
quizAttemptSchema.methods.isExpired = function() {
  if (this.timeLimit === 0) return false; // No time limit
  
  const now = new Date();
  const timeElapsed = (now - this.startedAt) / 1000; // in seconds
  
  return timeElapsed > this.timeLimit;
};

// Get time remaining
quizAttemptSchema.methods.getTimeRemaining = function() {
  if (this.timeLimit === 0) return null; // No time limit
  
  const now = new Date();
  const timeElapsed = (now - this.startedAt) / 1000; // in seconds
  const remaining = this.timeLimit - timeElapsed;
  
  return Math.max(0, remaining);
};

// Remove sensitive data when converting to JSON
quizAttemptSchema.methods.toJSON = function() {
  const attemptObject = this.toObject();
  return attemptObject;
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
