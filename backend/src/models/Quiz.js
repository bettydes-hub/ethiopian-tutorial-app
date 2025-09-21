const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tutorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial',
    required: [true, 'Tutorial ID is required']
  },
  timeLimit: {
    type: Number, // in seconds
    min: [0, 'Time limit cannot be negative'],
    default: 0 // 0 means no time limit
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Total points cannot be negative']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  passingScore: {
    type: Number,
    default: 60, // percentage
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  maxAttempts: {
    type: Number,
    default: 0, // 0 means unlimited attempts
    min: [0, 'Max attempts cannot be negative']
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showExplanations: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
quizSchema.index({ tutorialId: 1 });
quizSchema.index({ teacherId: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ createdAt: -1 });

// Calculate total points when questions are added/removed
quizSchema.methods.calculateTotalPoints = async function() {
  const Question = mongoose.model('Question');
  const questions = await Question.find({ 
    _id: { $in: this.questions },
    isActive: true 
  });
  
  this.totalPoints = questions.reduce((total, question) => total + question.points, 0);
  return this.save({ validateBeforeSave: false });
};

// Get questions in order
quizSchema.methods.getOrderedQuestions = async function() {
  const Question = mongoose.model('Question');
  return await Question.find({ 
    _id: { $in: this.questions },
    isActive: true 
  }).sort({ order: 1 });
};

// Check if user can attempt quiz
quizSchema.methods.canAttempt = async function(userId) {
  if (this.maxAttempts === 0) return true; // Unlimited attempts
  
  const QuizAttempt = mongoose.model('QuizAttempt');
  const attempts = await QuizAttempt.countDocuments({ 
    userId: userId, 
    quizId: this._id 
  });
  
  return attempts < this.maxAttempts;
};

// Remove sensitive data when converting to JSON
quizSchema.methods.toJSON = function() {
  const quizObject = this.toObject();
  return quizObject;
};

module.exports = mongoose.model('Quiz', quizSchema);
