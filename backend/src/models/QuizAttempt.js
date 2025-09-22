const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
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
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  total_questions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  correct_answers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  time_taken: {
    type: DataTypes.INTEGER,
    allowNull: false, // in minutes
    validate: {
      min: 0
    }
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  is_passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'timeout', 'abandoned'),
    allowNull: false,
    defaultValue: 'in_progress'
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['quiz_id']
    },
    {
      fields: ['is_passed']
    },
    {
      fields: ['score']
    },
    {
      fields: ['user_id', 'quiz_id']
    }
  ]
});

// Instance methods
QuizAttempt.prototype.calculateScore = function() {
  const percentage = (this.correct_answers / this.total_questions) * 100;
  this.score = parseFloat(percentage.toFixed(2));
  return this.score;
};

QuizAttempt.prototype.checkPassed = function(passingScore = 70) {
  this.is_passed = this.score >= passingScore;
  return this.is_passed;
};

module.exports = QuizAttempt;