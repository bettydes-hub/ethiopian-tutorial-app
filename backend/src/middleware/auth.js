const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../../config/config');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refreshTokens'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Check if user has specific role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = authorizeRole('admin');

// Check if user is teacher or admin
const requireTeacher = authorizeRole('teacher', 'admin');

// Check if user is student, teacher, or admin
const requireUser = authorizeRole('student', 'teacher', 'admin');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refreshTokens'] }
    });
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = resourceUserId && resourceUserId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only access your own resources'
      });
    }

    next();
  };
};

// Check if user can access tutorial (student enrolled or teacher/admin)
const canAccessTutorial = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const tutorialId = req.params.tutorialId || req.params.id;
    const Tutorial = require('../models/Tutorial');
    const Progress = require('../models/Progress');

    const tutorial = await Tutorial.findByPk(tutorialId);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        error: 'Tutorial not found'
      });
    }

    // Admin and teacher can access any tutorial
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      return next();
    }

    // Check if student has progress record (enrolled)
    const progress = await Progress.findOne({
      where: {
        userId: req.user.id,
        tutorialId: tutorialId
      }
    });

    if (!progress) {
      return res.status(403).json({
        success: false,
        error: 'You must enroll in this tutorial to access it'
      });
    }

    next();
  } catch (error) {
    console.error('Tutorial access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify tutorial access'
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  requireAdmin,
  requireTeacher,
  requireUser,
  optionalAuth,
  requireOwnershipOrAdmin,
  canAccessTutorial
};
