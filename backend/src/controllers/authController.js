const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../../config/config');
const { formatResponse } = require('../utils/helpers');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, null, '', 'User with this email already exists')
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Note: Refresh token functionality not fully implemented

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError.message);
    }

    res.status(201).json(
      formatResponse(true, {
        user: user.toJSON ? user.toJSON() : user,
        token,
        refreshToken
      }, 'User registered successfully')
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Registration failed')
    );
  }
};

// Login user
const login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(401).json(
        formatResponse(false, null, '', 'Invalid credentials')
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      let errorMessage = 'Account is not active';
      if (user.status === 'blocked') {
        errorMessage = 'Account is blocked. Please contact support for assistance.';
      } else if (user.status === 'pending') {
        errorMessage = 'Account is pending approval. Please wait for admin approval.';
      }
      
      return res.status(403).json(
        formatResponse(false, null, '', errorMessage)
      );
    }

    // Compare password
    console.log('Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse(false, null, '', 'Invalid credentials')
      );
    }

    // Check if user must change password
    if (user.must_change_password) {
      // Generate a temporary token for password change
      const tempToken = generateToken(user.id);
      
      return res.status(200).json(
        formatResponse(true, {
          user: user.toJSON ? user.toJSON() : user,
          token: tempToken,
          mustChangePassword: true
        }, 'Password change required')
      );
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Note: Refresh token functionality not fully implemented

    res.json(
      formatResponse(true, {
        user: user.toJSON ? user.toJSON() : user,
        token,
        refreshToken,
        mustChangePassword: false
      }, 'Login successful')
    );
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json(
      formatResponse(false, null, '', 'Login failed')
    );
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }

    res.json(
      formatResponse(true, null, 'Logged out successfully')
    );
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Logout failed')
    );
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json(
      formatResponse(true, { user }, 'User retrieved successfully')
    );
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get user')
    );
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json(
        formatResponse(false, null, '', 'Refresh token required')
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json(
        formatResponse(false, null, '', 'Invalid refresh token')
      );
    }

    // Note: Refresh token validation not fully implemented
    // For now, just verify the token is valid

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Note: Refresh token management not fully implemented

    res.json(
      formatResponse(true, {
        token: newToken,
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully')
    );
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json(
        formatResponse(false, null, '', 'Invalid refresh token')
      );
    }

    console.error('Refresh token error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Token refresh failed')
    );
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Check if account is active
    if (user.status !== 'active') {
      let errorMessage = 'Account is not active';
      if (user.status === 'blocked') {
        errorMessage = 'Account is blocked. You cannot change your password. Please contact support for assistance.';
      } else if (user.status === 'pending') {
        errorMessage = 'Account is pending approval. You cannot change your password until approved.';
      }
      
      return res.status(403).json(
        formatResponse(false, null, '', errorMessage)
      );
    }

    // Get user with password
    const userWithPassword = await User.findByPk(user.id, {
      attributes: { include: ['password'] }
    });

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Current password is incorrect')
      );
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // Note: Refresh token management not fully implemented

    res.json(
      formatResponse(true, null, 'Password changed successfully')
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Password change failed')
    );
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, profilePicture } = req.body;
    const user = req.user;

    // Check if account is active
    if (user.status !== 'active') {
      let errorMessage = 'Account is not active';
      if (user.status === 'blocked') {
        errorMessage = 'Account is blocked. You cannot update your profile. Please contact support for assistance.';
      } else if (user.status === 'pending') {
        errorMessage = 'Account is pending approval. You cannot update your profile until approved.';
      }
      
      return res.status(403).json(
        formatResponse(false, null, '', errorMessage)
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

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json(
      formatResponse(true, { user: user.toJSON() }, 'Profile updated successfully')
    );
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Profile update failed')
    );
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json(
        formatResponse(true, null, 'If the email exists, a reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError.message);
      return res.status(500).json(
        formatResponse(false, null, '', 'Failed to send reset email')
      );
    }

    res.json(
      formatResponse(true, null, 'If the email exists, a reset link has been sent')
    );
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Password reset request failed')
    );
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json(
        formatResponse(false, null, '', 'Invalid reset token')
      );
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Invalid reset token')
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Note: Refresh token management not fully implemented

    res.json(
      formatResponse(true, null, 'Password reset successfully')
    );
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json(
        formatResponse(false, null, '', 'Invalid or expired reset token')
      );
    }

    console.error('Reset password error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Password reset failed')
    );
  }
};

// Force change password (for admin-created users)
const forceChangePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json(
        formatResponse(false, null, '', 'New password and confirmation are required')
      );
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Passwords do not match')
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Password must be at least 6 characters long')
      );
    }

    // Check if new password is not the default password
    if (newPassword === 'changeme') {
      return res.status(400).json(
        formatResponse(false, null, '', 'You cannot use the default password. Please choose a different password.')
      );
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, '', 'User not found')
      );
    }

    // Check if user actually needs to change password
    if (!user.must_change_password) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Password change is not required for this account')
      );
    }

    // Update password and clear must_change_password flag
    user.password = newPassword;
    user.must_change_password = false;
    await user.save();

    // Generate tokens for immediate login
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json(
      formatResponse(true, {
        user: user.toJSON ? user.toJSON() : user,
        token,
        refreshToken,
        mustChangePassword: false
      }, 'Password changed successfully. You are now logged in.')
    );
  } catch (error) {
    console.error('Force change password error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to change password')
    );
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  changePassword,
  forceChangePassword,
  updateProfile,
  requestPasswordReset,
  resetPassword
};
