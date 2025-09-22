const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tutorial = sequelize.define('Tutorial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500]
    }
  },
  long_description: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 2000]
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  video_url: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  pdf_url: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  students: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  learning_objectives: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'tutorials',
  timestamps: true,
  indexes: [
    {
      fields: ['title', 'description', 'long_description'],
      type: 'GIN'
    },
    {
      fields: ['category']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['teacher_id']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['rating']
    }
  ]
});

// Virtual for average rating
Tutorial.prototype.getAverageRating = function() {
  return this.rating_count > 0 ? parseFloat(this.rating).toFixed(1) : 0;
};

// Instance methods
Tutorial.prototype.updateStudentCount = async function() {
  const Progress = require('./Progress');
  const count = await Progress.count({
    where: {
      tutorial_id: this.id,
      status: ['in_progress', 'completed']
    }
  });
  this.students = count;
  return this.save();
};

Tutorial.prototype.addRating = function(newRating) {
  this.rating = parseFloat(this.rating) + newRating;
  this.rating_count += 1;
  return this.save();
};

Tutorial.prototype.updateRating = function(oldRating, newRating) {
  this.rating = parseFloat(this.rating) - oldRating + newRating;
  return this.save();
};

Tutorial.prototype.removeRating = function(rating) {
  this.rating = parseFloat(this.rating) - rating;
  this.rating_count -= 1;
  return this.save();
};

Tutorial.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  values.average_rating = this.getAverageRating();
  return values;
};

module.exports = Tutorial;