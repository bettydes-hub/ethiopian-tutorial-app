const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken, requireTeacher } = require('../middleware/auth');
const {
  validateQuizCreation,
  validateQuizAttempt,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Public authenticated routes
router.get('/', validatePagination, quizController.getAllQuizzes);
router.get('/:id', validateObjectId('id'), quizController.getQuizById);
router.get('/:id/attempts', validateObjectId('id'), validatePagination, quizController.getQuizAttempts);
router.get('/user/:userId/attempts', validateObjectId('userId'), validatePagination, quizController.getUserQuizAttempts);

// Student routes
router.post('/:id/start', validateObjectId('id'), quizController.startQuizAttempt);
router.post('/attempt/:id/submit', validateObjectId('id'), validateQuizAttempt, quizController.submitQuizAttempt);

// Teacher/Admin routes
router.post('/', requireTeacher, validateQuizCreation, quizController.createQuiz);
router.put('/:id', validateObjectId('id'), quizController.updateQuiz);
router.delete('/:id', validateObjectId('id'), quizController.deleteQuiz);
router.patch('/:id/publish', validateObjectId('id'), quizController.togglePublishStatus);

module.exports = router;
