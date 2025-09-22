const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const { authenticateToken, requireTeacher, canAccessTutorial, optionalAuth } = require('../middleware/auth');
const {
  validateTutorialCreation,
  validateTutorialUpdate,
  validateProgressUpdate,
  validatePagination,
  validateSearch,
  validateObjectId
} = require('../middleware/validation');
const { videoUpload, pdfUpload, imageUpload, handleUploadError, cleanupUploadedFiles, generateFileUrl } = require('../middleware/upload');

// Public routes (with optional authentication)
router.get('/', optionalAuth, validatePagination, validateSearch, tutorialController.getAllTutorials);
router.get('/category/:category', optionalAuth, validatePagination, tutorialController.getTutorialsByCategory);
router.get('/:id', optionalAuth, validateObjectId('id'), tutorialController.getTutorialById);

// Protected routes
router.use(authenticateToken);

// Teacher/Admin routes
router.post('/', requireTeacher, validateTutorialCreation, tutorialController.createTutorial);
router.put('/:id', validateObjectId('id'), tutorialController.updateTutorial);
router.delete('/:id', validateObjectId('id'), tutorialController.deleteTutorial);
router.patch('/:id/publish', validateObjectId('id'), tutorialController.togglePublishStatus);
router.post('/:id/rating', validateObjectId('id'), tutorialController.addRating);

// Student routes
router.post('/:id/progress', validateObjectId('id'), validateProgressUpdate, tutorialController.updateProgress);
router.get('/:id/progress', validateObjectId('id'), tutorialController.getUserProgress);
router.get('/user/progress', validatePagination, tutorialController.getAllUserProgress);

// File upload routes
router.post('/upload/video', authenticateToken, requireTeacher, videoUpload.single('video'), cleanupUploadedFiles, tutorialController.uploadVideo);
router.post('/upload/pdf', authenticateToken, requireTeacher, pdfUpload.single('pdf'), cleanupUploadedFiles, tutorialController.uploadPdf);
router.post('/upload/thumbnail', authenticateToken, requireTeacher, imageUpload.single('thumbnail'), cleanupUploadedFiles, tutorialController.uploadThumbnail);

// Error handling for uploads
router.use(handleUploadError);

module.exports = router;
