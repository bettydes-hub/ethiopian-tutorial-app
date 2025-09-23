const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateAdminUserCreation,
  validateUserUpdate,
  validatePagination,
  validateSearch,
  validateObjectId
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, validatePagination, validateSearch, userController.getAllUsers);
router.post('/', requireAdmin, validateAdminUserCreation, userController.createUser);
router.put('/:id', requireAdmin, validateObjectId('id'), validateUserUpdate, userController.updateUser);
router.delete('/:id', requireAdmin, validateObjectId('id'), userController.deleteUser);
router.post('/:id/block', requireAdmin, validateObjectId('id'), userController.blockUser);
router.post('/:id/unblock', requireAdmin, validateObjectId('id'), userController.unblockUser);
router.post('/:id/approve-teacher', requireAdmin, validateObjectId('id'), userController.approveTeacher);

// Public authenticated routes
router.get('/:id', validateObjectId('id'), userController.getUserById);
router.get('/:id/stats', validateObjectId('id'), userController.getUserStats);
router.get('/:id/tutorials', validateObjectId('id'), validatePagination, userController.getUserTutorials);
router.get('/:id/created-tutorials', validateObjectId('id'), validatePagination, userController.getUserCreatedTutorials);

module.exports = router;
