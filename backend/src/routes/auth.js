const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateUserUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);
router.post('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);
router.post('/force-change-password', authenticateToken, authController.forceChangePassword);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);

module.exports = router;
