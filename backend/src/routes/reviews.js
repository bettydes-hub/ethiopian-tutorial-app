const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// Get reviews for a tutorial
router.get('/tutorial/:id', validateObjectId('id'), validatePagination, reviewController.getTutorialReviews);

// Get user's review for a tutorial (requires authentication)
router.get('/user/:tutorialId', authenticateToken, validateObjectId('tutorialId'), reviewController.getUserReview);

// Create a review (requires authentication)
router.post('/tutorial/:id', authenticateToken, validateObjectId('id'), reviewController.createReview);

// Update a review (requires authentication)
router.put('/:id', authenticateToken, validateObjectId('id'), reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:id', authenticateToken, validateObjectId('id'), reviewController.deleteReview);

module.exports = router;
