const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000]
    }
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['tutorial_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['user_id', 'tutorial_id'],
      unique: true
    }
  ]
});

module.exports = Review;
