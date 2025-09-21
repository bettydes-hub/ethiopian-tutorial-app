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
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await User.countDocuments(query);
    
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
    
    const user = await User.findById(id).select('-password -refreshTokens');
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, null, '', 'User with this email already exists')
      );
    }
    
    const user = new User({
      name,
      email,
      password,
      role,
      status
    });
    
    await user.save();
    
    res.status(201).json(
      formatResponse(true, { user: user.toJSON() }, 'User created successfully')
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
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(
          formatResponse(false, null, '', 'Email already exists')
        );
      }
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    res.json(
      formatResponse(true, { user: user.toJSON() }, 'User updated successfully')
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
    
    const user = await User.findById(id);
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
    
    await User.findByIdAndDelete(id);
    
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
    
    const user = await User.findById(id);
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
    
    user.status = 'blocked';
    await user.save();
    
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
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    user.status = 'active';
    await user.save();
    
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
    
    const user = await User.findById(id);
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
    
    user.status = 'active';
    await user.save();
    
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
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Get user's progress
    const progress = await Progress.find({ userId: id });
    const completedTutorials = progress.filter(p => p.status === 'completed').length;
    const inProgressTutorials = progress.filter(p => p.status === 'in_progress').length;
    
    // Get user's created tutorials (for teachers)
    let createdTutorials = 0;
    if (user.role === 'teacher' || user.role === 'admin') {
      createdTutorials = await Tutorial.countDocuments({ teacherId: id });
    }
    
    // Get total time spent
    const totalTimeSpent = progress.reduce((total, p) => total + (p.timeSpent || 0), 0);
    
    const stats = {
      totalTutorials: progress.length,
      completedTutorials,
      inProgressTutorials,
      createdTutorials,
      totalTimeSpent,
      joinDate: user.joinDate,
      lastLogin: user.lastLogin
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
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }
    
    // Build progress query
    const progressQuery = { userId: id };
    if (status) {
      progressQuery.status = status;
    }
    
    // Get user's progress with tutorials
    const progress = await Progress.find(progressQuery)
      .populate('tutorialId')
      .sort({ lastAccessed: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Progress.countDocuments(progressQuery);
    
    // Format response
    const tutorials = progress.map(p => ({
      progress: p.toJSON(),
      tutorial: p.tutorialId
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
    
    const user = await User.findById(id);
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
    const tutorialQuery = { teacherId: id };
    if (status) {
      tutorialQuery.isPublished = status === 'published';
    }
    
    const tutorials = await Tutorial.find(tutorialQuery)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Tutorial.countDocuments(tutorialQuery);
    
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
