const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateCategoryCreation,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// Public routes
router.get('/', validatePagination, categoryController.getAllCategories);
router.get('/list', categoryController.getCategoryList);
router.get('/:id', validateObjectId('id'), categoryController.getCategoryById);
router.get('/:id/tutorials', validateObjectId('id'), validatePagination, categoryController.getCategoryWithTutorials);
router.get('/:id/stats', validateObjectId('id'), categoryController.getCategoryStats);

// Admin only routes
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', validateCategoryCreation, categoryController.createCategory);
router.put('/:id', validateObjectId('id'), categoryController.updateCategory);
router.delete('/:id', validateObjectId('id'), categoryController.deleteCategory);
router.patch('/:id/status', validateObjectId('id'), categoryController.toggleCategoryStatus);
router.patch('/:id/update-count', validateObjectId('id'), categoryController.updateCategoryTutorialCount);

module.exports = router;
