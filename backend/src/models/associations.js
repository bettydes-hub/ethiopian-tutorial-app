const User = require('./User');
const Tutorial = require('./Tutorial');
const Quiz = require('./Quiz');
const Question = require('./Question');
const QuizAttempt = require('./QuizAttempt');
const Progress = require('./Progress');
const Category = require('./Category');
const Review = require('./Review');

// User associations
User.hasMany(Tutorial, { 
  foreignKey: 'teacher_id', 
  as: 'tutorials' 
});
User.hasMany(Quiz, { 
  foreignKey: 'teacher_id', 
  as: 'quizzes' 
});
User.hasMany(QuizAttempt, { 
  foreignKey: 'user_id', 
  as: 'quizAttempts' 
});
User.hasMany(Progress, { 
  foreignKey: 'user_id', 
  as: 'progress' 
});
User.hasMany(Review, { 
  foreignKey: 'user_id', 
  as: 'reviews' 
});

// Tutorial associations
Tutorial.belongsTo(User, { 
  foreignKey: 'teacher_id', 
  as: 'teacher' 
});
Tutorial.hasMany(Quiz, { 
  foreignKey: 'tutorial_id', 
  as: 'quizzes' 
});
Tutorial.hasMany(Progress, { 
  foreignKey: 'tutorial_id', 
  as: 'progress' 
});
Tutorial.hasMany(Review, { 
  foreignKey: 'tutorial_id', 
  as: 'reviews' 
});

// Quiz associations
Quiz.belongsTo(User, { 
  foreignKey: 'teacher_id', 
  as: 'teacher' 
});
Quiz.belongsTo(Tutorial, { 
  foreignKey: 'tutorial_id', 
  as: 'tutorial' 
});
Quiz.hasMany(Question, { 
  foreignKey: 'quiz_id', 
  as: 'questions' 
});
Quiz.hasMany(QuizAttempt, { 
  foreignKey: 'quiz_id', 
  as: 'attempts' 
});

// Question associations
Question.belongsTo(Quiz, { 
  foreignKey: 'quiz_id', 
  as: 'quiz' 
});

// QuizAttempt associations
QuizAttempt.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
QuizAttempt.belongsTo(Quiz, { 
  foreignKey: 'quiz_id', 
  as: 'quiz' 
});

// Progress associations
Progress.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
Progress.belongsTo(Tutorial, { 
  foreignKey: 'tutorial_id', 
  as: 'tutorial' 
});

// Category associations - Note: Using string reference instead of foreign key
// Category.hasMany(Tutorial, { 
//   foreignKey: 'category', 
//   sourceKey: 'name',
//   as: 'tutorials' 
// });

// Review associations
Review.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
Review.belongsTo(Tutorial, { 
  foreignKey: 'tutorial_id', 
  as: 'tutorial' 
});

module.exports = {
  User,
  Tutorial,
  Quiz,
  Question,
  QuizAttempt,
  Progress,
  Category,
  Review
};
