const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tutorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial',
    required: [true, 'Tutorial ID is required']
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Time spent cannot be negative']
  },
  currentSection: {
    type: String,
    default: ''
  },
  notes: [{
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    section: String
  }],
  bookmarks: [{
    title: String,
    timestamp: Number, // video timestamp or page number
    section: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  quizAttempts: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt'
    },
    score: Number,
    isPassed: Boolean,
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  certificates: [{
    certificateId: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    score: Number,
    validUntil: Date
  }]
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per tutorial
progressSchema.index({ userId: 1, tutorialId: 1 }, { unique: true });

// Index for better query performance
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ tutorialId: 1, status: 1 });
progressSchema.index({ lastAccessed: -1 });
progressSchema.index({ completedAt: -1 });

// Update progress and status
progressSchema.methods.updateProgress = function(newProgress, section = '') {
  this.progress = Math.min(100, Math.max(0, newProgress));
  this.lastAccessed = new Date();
  this.currentSection = section;
  
  if (this.status === 'not_started' && newProgress > 0) {
    this.status = 'in_progress';
    this.startedAt = new Date();
  }
  
  if (newProgress >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save({ validateBeforeSave: false });
};

// Add time spent
progressSchema.methods.addTimeSpent = function(seconds) {
  this.timeSpent += seconds;
  this.lastAccessed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Add note
progressSchema.methods.addNote = function(content, section = '') {
  this.notes.push({
    content,
    section,
    timestamp: new Date()
  });
  return this.save({ validateBeforeSave: false });
};

// Add bookmark
progressSchema.methods.addBookmark = function(title, timestamp, section = '') {
  this.bookmarks.push({
    title,
    timestamp,
    section,
    createdAt: new Date()
  });
  return this.save({ validateBeforeSave: false });
};

// Remove bookmark
progressSchema.methods.removeBookmark = function(bookmarkId) {
  this.bookmarks = this.bookmarks.filter(bookmark => 
    bookmark._id.toString() !== bookmarkId
  );
  return this.save({ validateBeforeSave: false });
};

// Add quiz attempt
progressSchema.methods.addQuizAttempt = function(quizId, attemptId, score, isPassed) {
  this.quizAttempts.push({
    quizId,
    attemptId,
    score,
    isPassed,
    attemptedAt: new Date()
  });
  return this.save({ validateBeforeSave: false });
};

// Add certificate
progressSchema.methods.addCertificate = function(certificateId, score, validUntil) {
  this.certificates.push({
    certificateId,
    score,
    validUntil
  });
  return this.save({ validateBeforeSave: false });
};

// Get completion percentage
progressSchema.methods.getCompletionPercentage = function() {
  return this.progress;
};

// Check if tutorial is completed
progressSchema.methods.isCompleted = function() {
  return this.status === 'completed' && this.progress >= 100;
};

// Get time spent in readable format
progressSchema.methods.getTimeSpentFormatted = function() {
  const hours = Math.floor(this.timeSpent / 3600);
  const minutes = Math.floor((this.timeSpent % 3600) / 60);
  const seconds = this.timeSpent % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Remove sensitive data when converting to JSON
progressSchema.methods.toJSON = function() {
  const progressObject = this.toObject();
  progressObject.completionPercentage = this.getCompletionPercentage();
  progressObject.isCompleted = this.isCompleted();
  progressObject.timeSpentFormatted = this.getTimeSpentFormatted();
  return progressObject;
};

module.exports = mongoose.model('Progress', progressSchema);
