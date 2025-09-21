const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tutorial title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Tutorial description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  longDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Long description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Difficulty level is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  students: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document']
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
tutorialSchema.index({ title: 'text', description: 'text', longDescription: 'text' });
tutorialSchema.index({ category: 1 });
tutorialSchema.index({ difficulty: 1 });
tutorialSchema.index({ teacherId: 1 });
tutorialSchema.index({ isPublished: 1 });
tutorialSchema.index({ rating: -1 });
tutorialSchema.index({ createdAt: -1 });

// Virtual for average rating calculation
tutorialSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

// Update student count
tutorialSchema.methods.updateStudentCount = async function() {
  const Progress = mongoose.model('Progress');
  const count = await Progress.countDocuments({ 
    tutorialId: this._id, 
    status: { $in: ['in_progress', 'completed'] } 
  });
  this.students = count;
  return this.save({ validateBeforeSave: false });
};

// Add rating
tutorialSchema.methods.addRating = function(newRating) {
  this.rating += newRating;
  this.ratingCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Update rating
tutorialSchema.methods.updateRating = function(oldRating, newRating) {
  this.rating = this.rating - oldRating + newRating;
  return this.save({ validateBeforeSave: false });
};

// Remove rating
tutorialSchema.methods.removeRating = function(rating) {
  this.rating -= rating;
  this.ratingCount -= 1;
  return this.save({ validateBeforeSave: false });
};

// Remove sensitive data when converting to JSON
tutorialSchema.methods.toJSON = function() {
  const tutorialObject = this.toObject();
  tutorialObject.averageRating = this.averageRating;
  return tutorialObject;
};

module.exports = mongoose.model('Tutorial', tutorialSchema);
