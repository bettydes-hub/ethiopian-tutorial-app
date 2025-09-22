const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
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
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
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
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  time_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 30, // minutes
    validate: {
      min: 1,
      max: 180
    }
  },
  passing_score: {
    type: DataTypes.INTEGER,
    defaultValue: 70, // percentage
    validate: {
      min: 0,
      max: 100
    }
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 10
    }
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  total_questions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  indexes: [
    {
      fields: ['tutorial_id']
    },
    {
      fields: ['teacher_id']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Quiz.prototype.updateStats = async function() {
  const Question = require('./Question');
  const QuizAttempt = require('./QuizAttempt');
  
  const questionCount = await Question.count({
    where: { quiz_id: this.id }
  });
  
  const attemptCount = await QuizAttempt.count({
    where: { quiz_id: this.id }
  });
  
  const avgScore = await QuizAttempt.findOne({
    where: { quiz_id: this.id },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'average']
    ],
    raw: true
  });
  
  this.total_questions = questionCount;
  this.total_attempts = attemptCount;
  this.average_score = avgScore ? parseFloat(avgScore.average) || 0 : 0;
  
  return this.save();
};

module.exports = Quiz;