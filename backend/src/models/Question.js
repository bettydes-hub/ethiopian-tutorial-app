const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false'],
    required: [true, 'Question type is required']
  },
  options: [{
    type: String,
    trim: true,
    maxlength: [500, 'Option cannot exceed 500 characters']
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer is required'],
    min: [0, 'Correct answer index cannot be negative']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100'],
    default: 1
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  order: {
    type: Number,
    required: [true, 'Question order is required'],
    min: [1, 'Order must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
questionSchema.index({ quizId: 1, order: 1 });
questionSchema.index({ isActive: 1 });

// Validate correct answer based on question type
questionSchema.pre('save', function(next) {
  if (this.type === 'multiple_choice') {
    if (this.correctAnswer >= this.options.length) {
      return next(new Error('Correct answer index is out of range for multiple choice question'));
    }
  } else if (this.type === 'true_false') {
    if (this.correctAnswer !== 0 && this.correctAnswer !== 1) {
      return next(new Error('Correct answer for true/false must be 0 (false) or 1 (true)'));
    }
  }
  next();
});

// Remove sensitive data when converting to JSON
questionSchema.methods.toJSON = function() {
  const questionObject = this.toObject();
  return questionObject;
};

module.exports = mongoose.model('Question', questionSchema);
