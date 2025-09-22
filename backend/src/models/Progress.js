const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tutorial_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tutorials',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    defaultValue: 'not_started',
    allowNull: false
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // in minutes
  },
  last_position: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // video position in seconds
  },
  completed_at: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'progress',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['tutorial_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['user_id', 'tutorial_id']
    }
  ]
});

// Instance methods
Progress.prototype.updateProgress = function(percentage, timeSpent = 0) {
  this.progress_percentage = Math.min(100, Math.max(0, percentage));
  this.time_spent += timeSpent;
  
  if (percentage >= 100) {
    this.status = 'completed';
    this.completed_at = new Date();
  } else if (percentage > 0) {
    this.status = 'in_progress';
  }
  
  return this.save();
};

module.exports = Progress;