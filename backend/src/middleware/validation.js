const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

// Tutorial validation rules
const validateTutorialCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('longDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Long description cannot exceed 2000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('videoUrl')
    .optional()
    .isString()
    .withMessage('Video URL must be a string'),
  body('pdfUrl')
    .optional()
    .isString()
    .withMessage('PDF URL must be a string'),
  body('thumbnail')
    .optional()
    .isString()
    .withMessage('Thumbnail URL must be a string'),
  handleValidationErrors
];

const validateTutorialUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('longDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Long description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('duration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Duration cannot be empty'),
  body('videoUrl')
    .optional()
    .isString()
    .withMessage('Video URL must be a string'),
  body('pdfUrl')
    .optional()
    .isString()
    .withMessage('PDF URL must be a string'),
  body('thumbnail')
    .optional()
    .isString()
    .withMessage('Thumbnail URL must be a string'),
  handleValidationErrors
];

// Quiz validation rules
const validateQuizCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tutorialId')
    .isUUID()
    .withMessage('Tutorial ID must be a valid UUID'),
  body('timeLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time limit must be a non-negative integer'),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max attempts must be a non-negative integer'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  body('questions.*.question')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question text must be between 5 and 1000 characters'),
  body('questions.*.type')
    .optional()
    .isIn(['multiple_choice', 'true_false'])
    .withMessage('Question type must be multiple_choice or true_false'),
  body('questions.*.options')
    .custom((value, { req }) => {
      const questionIndex = req.body.questions.findIndex(q => q.options === value);
      const question = req.body.questions[questionIndex];
      
      if (question.type === 'multiple_choice') {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error('Multiple choice questions must have at least 2 options');
        }
        if (value.length > 6) {
          throw new Error('Multiple choice questions cannot have more than 6 options');
        }
      }
      return true;
    }),
  body('questions.*.correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a non-negative integer'),
  body('questions.*.points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  handleValidationErrors
];

// Question validation rules
const validateQuestionCreation = [
  body('question')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question text must be between 5 and 1000 characters'),
  body('type')
    .isIn(['multiple_choice', 'true_false'])
    .withMessage('Question type must be multiple_choice or true_false'),
  body('options')
    .custom((value, { req }) => {
      if (req.body.type === 'multiple_choice') {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error('Multiple choice questions must have at least 2 options');
        }
        if (value.length > 6) {
          throw new Error('Multiple choice questions cannot have more than 6 options');
        }
      }
      return true;
    }),
  body('correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a non-negative integer'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  body('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a valid integer'),
  handleValidationErrors
];

// Category validation rules
const validateCategoryCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be between 10 and 200 characters'),
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  handleValidationErrors
];

// Progress validation rules
const validateProgressUpdate = [
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed'])
    .withMessage('Status must be not_started, in_progress, or completed'),
  body('tutorialId')
    .isUUID()
    .withMessage('Tutorial ID must be a valid UUID'),
  handleValidationErrors
];

// Quiz attempt validation rules
const validateQuizAttempt = [
  body('answers')
    .isObject()
    .withMessage('Answers must be an object'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

// Custom validation for file uploads
const validateFileUpload = (fieldName, allowedTypes, maxSize) => [
  body(fieldName)
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error(`${fieldName} is required`);
      }
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      if (req.file.size > maxSize) {
        throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      }
      
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateTutorialCreation,
  validateTutorialUpdate,
  validateQuizCreation,
  validateQuestionCreation,
  validateCategoryCreation,
  validateProgressUpdate,
  validateQuizAttempt,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateFileUpload
};
