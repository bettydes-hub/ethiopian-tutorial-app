const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code'],
    default: '#3B82F6'
  },
  tutorialCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

// Update tutorial count when tutorials are added/removed
categorySchema.methods.updateTutorialCount = async function() {
  const Tutorial = mongoose.model('Tutorial');
  const count = await Tutorial.countDocuments({ category: this.name, isPublished: true });
  this.tutorialCount = count;
  return this.save({ validateBeforeSave: false });
};

// Remove sensitive data when converting to JSON
categorySchema.methods.toJSON = function() {
  const categoryObject = this.toObject();
  return categoryObject;
};

module.exports = mongoose.model('Category', categorySchema);
