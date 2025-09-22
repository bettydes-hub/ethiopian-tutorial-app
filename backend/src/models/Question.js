const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer'),
    allowNull: false,
    defaultValue: 'multiple_choice'
  },
  options: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  correct_answer: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  explanation: {
    type: DataTypes.TEXT
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'questions',
  timestamps: true,
  indexes: [
    {
      fields: ['quiz_id']
    },
    {
      fields: ['question_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order']
    }
  ]
});

module.exports = Question;