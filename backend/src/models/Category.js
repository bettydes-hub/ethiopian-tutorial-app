const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#1890ff',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  icon: {
    type: DataTypes.STRING(100),
    defaultValue: 'BookOutlined'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tutorial_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Category.prototype.updateTutorialCount = async function() {
  const Tutorial = require('./Tutorial');
  const count = await Tutorial.count({
    where: {
      category: this.name,
      is_published: true
    }
  });
  this.tutorial_count = count;
  return this.save();
};

module.exports = Category;