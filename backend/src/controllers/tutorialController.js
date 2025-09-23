const { Op } = require('sequelize');
const Tutorial = require('../models/Tutorial');
const Progress = require('../models/Progress');
const Category = require('../models/Category');
const { formatResponse, formatPaginatedResponse, calculatePagination, generateSearchRegex } = require('../utils/helpers');

// Get all tutorials
const getAllTutorials = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      category, 
      difficulty, 
      search, 
      teacherId,
      isPublished,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (teacherId) {
      query.teacher_id = teacherId;
    }
    
    if (isPublished !== undefined) {
      query.is_published = isPublished === 'true';
    }
    
    // Build search conditions for Sequelize
    const searchConditions = search ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { long_description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ]
    } : {};
    
    const whereClause = { ...query, ...searchConditions };
    
    // Build sort order
    const order = [[sortBy === 'createdAt' ? 'created_at' : sortBy, sortOrder.toUpperCase()]];
    
    // Get tutorials with pagination
    const { count, rows: tutorials } = await Tutorial.findAndCountAll({
      where: whereClause,
      include: [{
        model: require('../models/User'),
        as: 'teacher',
        attributes: ['id', 'name', 'email', 'profile_picture']
      }],
      order: order,
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    res.json(
      formatPaginatedResponse(tutorials, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get all tutorials error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get tutorials')
    );
  }
};

// Get tutorial by ID
const getTutorialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutorial = await Tutorial.findByPk(id, {
      include: [
        {
          model: require('../models/User'),
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'profile_picture', 'bio']
        },
        {
          model: require('../models/Quiz'),
          as: 'quizzes',
          where: { is_published: true },
          required: false,
          include: [
            {
              model: require('../models/Question'),
              as: 'questions',
              where: { is_active: true },
              required: false
            }
          ]
        }
      ]
    });
    
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    res.json(
      formatResponse(true, { tutorial }, 'Tutorial retrieved successfully')
    );
  } catch (error) {
    console.error('Get tutorial by ID error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get tutorial')
    );
  }
};

// Create tutorial
const createTutorial = async (req, res) => {
  try {
    console.log('=== BACKEND TUTORIAL CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from token:', req.user);
    console.log('Request headers:', req.headers);
    
    const {
      title,
      description,
      longDescription,
      category,
      difficulty,
      duration,
      videoUrl,
      pdfUrl,
      thumbnail,
      tags,
      prerequisites,
      learningObjectives,
      resources
    } = req.body;
    
    console.log('Extracted fields:', {
      title,
      description,
      longDescription,
      category,
      difficulty,
      duration,
      videoUrl,
      pdfUrl,
      thumbnail,
      hasTitle: !!title,
      hasDescription: !!description,
      hasCategory: !!category,
      hasVideoUrl: !!videoUrl,
      hasPdfUrl: !!pdfUrl,
      hasThumbnail: !!thumbnail
    });
    
    const teacherId = req.user.id;
    
    // Verify category exists
    const categoryExists = await Category.findOne({ where: { name: category } });
    if (!categoryExists) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Category does not exist')
      );
    }
    
    const tutorial = await Tutorial.create({
      title,
      description,
      long_description: longDescription,
      category,
      difficulty: difficulty.toLowerCase(), // Convert to lowercase for database enum
      duration,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      thumbnail,
      teacher_id: teacherId,
      tags: tags || [],
      prerequisites: prerequisites || [],
      learning_objectives: learningObjectives || []
    });
    
    // Update category tutorial count
    await categoryExists.increment('tutorial_count');
    
    // Update teacher's tutorial count
    const User = require('../models/User');
    await User.increment('tutorials_created', { where: { id: teacherId } });
    
    res.status(201).json(
      formatResponse(true, { tutorial }, 'Tutorial created successfully')
    );
  } catch (error) {
    console.error('Create tutorial error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to create tutorial')
    );
  }
};

// Update tutorial
const updateTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can update this tutorial
    if (req.user.role !== 'admin' && tutorial.teacher_id !== req.user.id) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only update your own tutorials')
      );
    }
    
    // Update tutorial
    await tutorial.update(updateData);
    
    res.json(
      formatResponse(true, { tutorial }, 'Tutorial updated successfully')
    );
  } catch (error) {
    console.error('Update tutorial error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update tutorial')
    );
  }
};

// Delete tutorial
const deleteTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can delete this tutorial
    if (req.user.role !== 'admin' && tutorial.teacher_id !== req.user.id) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only delete your own tutorials')
      );
    }
    
    // Delete related progress records
    await Progress.destroy({ where: { tutorial_id: id } });
    
    // Update category tutorial count
    const category = await Category.findOne({ where: { name: tutorial.category } });
    if (category) {
      await category.decrement('tutorial_count');
    }
    
    // Update teacher's tutorial count
    const User = require('../models/User');
    await User.decrement('tutorials_created', { where: { id: tutorial.teacher_id } });
    
    await tutorial.destroy();
    
    res.json(
      formatResponse(true, null, 'Tutorial deleted successfully')
    );
  } catch (error) {
    console.error('Delete tutorial error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to delete tutorial')
    );
  }
};

// Get tutorials by category
const getTutorialsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page, limit, difficulty, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = { category, is_published: true };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Build sort order
    const order = [[sortBy === 'createdAt' ? 'created_at' : sortBy, sortOrder.toUpperCase()]];
    
    const { count, rows: tutorials } = await Tutorial.findAndCountAll({
      where: query,
      include: [{
        model: require('../models/User'),
        as: 'teacher',
        attributes: ['id', 'name', 'email', 'profile_picture']
      }],
      order: order,
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    res.json(
      formatPaginatedResponse(tutorials, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get tutorials by category error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get tutorials by category')
    );
  }
};

// Update tutorial progress
const updateProgress = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const { progress, status, currentSection } = req.body;
    const userId = req.user.id;
    
    // Find or create progress record
    let progressRecord = await Progress.findOne({
      where: {
        user_id: userId,
        tutorial_id: tutorialId
      }
    });
    
    if (!progressRecord) {
      progressRecord = await Progress.create({
        user_id: userId,
        tutorial_id: tutorialId,
        progress_percentage: 0,
        status: 'not_started'
      });
    }
    
    // Update progress
    await progressRecord.update({
      progress_percentage: progress,
      status: status,
      last_position: currentSection
    });
    
    res.json(
      formatResponse(true, { progress: progressRecord }, 'Progress updated successfully')
    );
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update progress')
    );
  }
};

// Get user progress for tutorial
const getUserProgress = async (req, res) => {
  try {
    const { id: tutorialId } = req.params;
    const userId = req.user.id;
    
    const progress = await Progress.findOne({
      where: {
        user_id: userId,
        tutorial_id: tutorialId
      }
    });
    
    if (!progress) {
      return res.json(
        formatResponse(true, { 
          progress: {
            user_id: userId,
            tutorial_id: tutorialId,
            progress_percentage: 0,
            status: 'not_started',
            time_spent: 0
          }
        }, 'Progress retrieved successfully')
      );
    }
    
    res.json(
      formatResponse(true, { progress }, 'Progress retrieved successfully')
    );
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get progress')
    );
  }
};

// Get all user progress
const getAllUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, status } = req.query;
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = { user_id: userId };
    if (status) {
      query.status = status;
    }
    
    const { count, rows: progress } = await Progress.findAndCountAll({
      where: query,
      include: [{
        model: require('../models/Tutorial'),
        as: 'tutorial',
        attributes: ['id', 'title', 'description', 'category', 'difficulty', 'duration', 'thumbnail']
      }],
      order: [['updated_at', 'DESC']],
      offset: pagination.skip,
      limit: pagination.limit
    });
    
    const total = count;
    
    res.json(
      formatPaginatedResponse(progress, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get all user progress error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get progress')
    );
  }
};

// Publish/Unpublish tutorial
const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can publish this tutorial
    if (req.user.role !== 'admin' && tutorial.teacher_id !== req.user.id) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only publish your own tutorials')
      );
    }
    
    await tutorial.update({ is_published: !tutorial.is_published });
    
    res.json(
      formatResponse(true, { tutorial }, `Tutorial ${tutorial.is_published ? 'published' : 'unpublished'} successfully`)
    );
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update publish status')
    );
  }
};

// Add tutorial rating
const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Rating must be between 1 and 5')
      );
    }
    
    const tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Update rating (simplified version)
    const newRatingCount = tutorial.rating_count + 1;
    const newRating = ((tutorial.rating * tutorial.rating_count) + rating) / newRatingCount;
    
    await tutorial.update({
      rating: newRating,
      rating_count: newRatingCount
    });
    
    res.json(
      formatResponse(true, { tutorial }, 'Rating added successfully')
    );
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to add rating')
    );
  }
};

// Upload video file
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, null, '', 'No video file uploaded')
      );
    }

    const { generateFileUrl } = require('../middleware/upload');
    const videoUrl = generateFileUrl(req, req.file);

    res.json(
      formatResponse(true, { 
        videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }, 'Video uploaded successfully')
    );
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to upload video')
    );
  }
};

// Upload PDF file
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, null, '', 'No PDF file uploaded')
      );
    }

    const { generateFileUrl } = require('../middleware/upload');
    const pdfUrl = generateFileUrl(req, req.file);

    res.json(
      formatResponse(true, { 
        pdfUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }, 'PDF uploaded successfully')
    );
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to upload PDF')
    );
  }
};

// Upload thumbnail image
const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, null, '', 'No thumbnail image uploaded')
      );
    }

    const { generateFileUrl } = require('../middleware/upload');
    const thumbnailUrl = generateFileUrl(req, req.file);

    res.json(
      formatResponse(true, { 
        thumbnailUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }, 'Thumbnail uploaded successfully')
    );
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to upload thumbnail')
    );
  }
};

module.exports = {
  getAllTutorials,
  getTutorialById,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getTutorialsByCategory,
  updateProgress,
  getUserProgress,
  getAllUserProgress,
  togglePublishStatus,
  addRating,
  uploadVideo,
  uploadPdf,
  uploadThumbnail
};
