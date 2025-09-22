const { Op } = require('sequelize');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Tutorial = require('../models/Tutorial');
const { formatResponse, formatPaginatedResponse, calculatePagination } = require('../utils/helpers');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Build search conditions for Sequelize
    const searchConditions = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};
    
    const whereClause = { ...query, ...searchConditions };
    
    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    res.json(
      formatPaginatedResponse(users, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get users')
    );
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    res.json(
      formatResponse(true, { user }, 'User retrieved successfully')
    );
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get user')
    );
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status = 'active' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, null, '', 'User with this email already exists')
      );
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      status
    });
    
    res.status(201).json(
      formatResponse(true, { user: user.toJSON ? user.toJSON() : user }, 'User created successfully')
    );
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to create user')
    );
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, bio } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json(
          formatResponse(false, null, '', 'Email already exists')
        );
      }
    }
    
    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (bio !== undefined) updateData.bio = bio;
    
    await user.update(updateData);
    
    res.json(
      formatResponse(true, { user: user.toJSON ? user.toJSON() : user }, 'User updated successfully')
    );
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update user')
    );
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json(
        formatResponse(false, null, '', 'Cannot delete admin users')
      );
    }
    
    await user.destroy();
    
    res.json(
      formatResponse(true, null, 'User deleted successfully')
    );
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to delete user')
    );
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    if (user.role === 'admin') {
      return res.status(400).json(
        formatResponse(false, null, '', 'Cannot block admin users')
      );
    }
    
    await user.update({ status: 'blocked' });
    
    res.json(
      formatResponse(true, null, 'User blocked successfully')
    );
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to block user')
    );
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    await user.update({ status: 'active' });
    
    res.json(
      formatResponse(true, null, 'User unblocked successfully')
    );
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to unblock user')
    );
  }
};

// Approve teacher
const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json(
        formatResponse(false, null, '', 'User is not a teacher')
      );
    }
    
    await user.update({ status: 'active' });
    
    res.json(
      formatResponse(true, null, 'Teacher approved successfully')
    );
  } catch (error) {
    console.error('Approve teacher error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to approve teacher')
    );
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Get user's progress
    const progress = await Progress.findAll({ where: { user_id: id } });
    const completedTutorials = progress.filter(p => p.status === 'completed').length;
    const inProgressTutorials = progress.filter(p => p.status === 'in_progress').length;
    
    // Get user's created tutorials (for teachers)
    let createdTutorials = 0;
    if (user.role === 'teacher' || user.role === 'admin') {
      createdTutorials = await Tutorial.count({ where: { teacher_id: id } });
    }
    
    // Get total time spent
    const totalTimeSpent = progress.reduce((total, p) => total + (p.time_spent || 0), 0);
    
    const stats = {
      totalTutorials: progress.length,
      completedTutorials,
      inProgressTutorials,
      createdTutorials,
      totalTimeSpent,
      joinDate: user.join_date,
      lastLogin: user.last_login
    };
    
    res.json(
      formatResponse(true, { stats }, 'User statistics retrieved successfully')
    );
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get user statistics')
    );
  }
};

// Get user's tutorials
const getUserTutorials = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, status } = req.query;
    const pagination = calculatePagination(page, limit);
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Build progress query
    const progressQuery = { user_id: id };
    if (status) {
      progressQuery.status = status;
    }
    
    // Get user's progress with tutorials
    const { count, rows: progress } = await Progress.findAndCountAll({
      where: progressQuery,
      include: [{
        model: Tutorial,
        as: 'tutorial'
      }],
      order: [['updated_at', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    // Format response
    const tutorials = progress.map(p => ({
      progress: p.toJSON ? p.toJSON() : p,
      tutorial: p.tutorial
    }));
    
    res.json(
      formatPaginatedResponse(tutorials, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get user tutorials error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get user tutorials')
    );
  }
};

// Get user's created tutorials (for teachers)
const getUserCreatedTutorials = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, status } = req.query;
    const pagination = calculatePagination(page, limit);
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, null, '', 'Only teachers can have created tutorials')
      );
    }
    
    // Build tutorial query
    const tutorialQuery = { teacher_id: id };
    if (status) {
      tutorialQuery.is_published = status === 'published';
    }
    
    const { count, rows: tutorials } = await Tutorial.findAndCountAll({
      where: tutorialQuery,
      order: [['created_at', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    res.json(
      formatPaginatedResponse(tutorials, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get user created tutorials error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get created tutorials')
    );
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  approveTeacher,
  getUserStats,
  getUserTutorials,
  getUserCreatedTutorials
};
