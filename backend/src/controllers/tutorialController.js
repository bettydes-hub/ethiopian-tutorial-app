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
      query.teacherId = teacherId;
    }
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    if (search) {
      const searchRegex = generateSearchRegex(search);
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { longDescription: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get tutorials with pagination
    const tutorials = await Tutorial.find(query)
      .populate('teacherId', 'name email profilePicture')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Tutorial.countDocuments(query);
    
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
    
    const tutorial = await Tutorial.findById(id)
      .populate('teacherId', 'name email profilePicture bio');
    
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
    
    const teacherId = req.user._id;
    
    // Verify category exists
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Category does not exist')
      );
    }
    
    const tutorial = new Tutorial({
      title,
      description,
      longDescription,
      category,
      difficulty,
      duration,
      videoUrl,
      pdfUrl,
      thumbnail,
      teacherId,
      tags: tags || [],
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      resources: resources || []
    });
    
    await tutorial.save();
    
    // Update category tutorial count
    await categoryExists.updateTutorialCount();
    
    // Update teacher's tutorial count
    const User = require('../models/User');
    await User.findByIdAndUpdate(teacherId, { $inc: { tutorialsCreated: 1 } });
    
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
    
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can update this tutorial
    if (req.user.role !== 'admin' && tutorial.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only update your own tutorials')
      );
    }
    
    // Update tutorial
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        tutorial[key] = updateData[key];
      }
    });
    
    await tutorial.save();
    
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
    
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can delete this tutorial
    if (req.user.role !== 'admin' && tutorial.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only delete your own tutorials')
      );
    }
    
    // Delete related progress records
    await Progress.deleteMany({ tutorialId: id });
    
    // Update category tutorial count
    const category = await Category.findOne({ name: tutorial.category });
    if (category) {
      await category.updateTutorialCount();
    }
    
    // Update teacher's tutorial count
    const User = require('../models/User');
    await User.findByIdAndUpdate(tutorial.teacherId, { $inc: { tutorialsCreated: -1 } });
    
    await Tutorial.findByIdAndDelete(id);
    
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
    const query = { category, isPublished: true };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const tutorials = await Tutorial.find(query)
      .populate('teacherId', 'name email profilePicture')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Tutorial.countDocuments(query);
    
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
    const userId = req.user._id;
    
    // Find or create progress record
    let progressRecord = await Progress.findOne({
      userId,
      tutorialId
    });
    
    if (!progressRecord) {
      progressRecord = new Progress({
        userId,
        tutorialId,
        progress: 0,
        status: 'not_started'
      });
    }
    
    // Update progress
    await progressRecord.updateProgress(progress, currentSection);
    
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
    const { tutorialId } = req.params;
    const userId = req.user._id;
    
    const progress = await Progress.findOne({
      userId,
      tutorialId
    });
    
    if (!progress) {
      return res.json(
        formatResponse(true, { 
          progress: {
            userId,
            tutorialId,
            progress: 0,
            status: 'not_started',
            timeSpent: 0
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
    const userId = req.user._id;
    const { page, limit, status } = req.query;
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }
    
    const progress = await Progress.find(query)
      .populate('tutorialId', 'title description category difficulty duration thumbnail')
      .sort({ lastAccessed: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Progress.countDocuments(query);
    
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
    
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user can publish this tutorial
    if (req.user.role !== 'admin' && tutorial.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, null, '', 'You can only publish your own tutorials')
      );
    }
    
    tutorial.isPublished = !tutorial.isPublished;
    await tutorial.save();
    
    res.json(
      formatResponse(true, { tutorial }, `Tutorial ${tutorial.isPublished ? 'published' : 'unpublished'} successfully`)
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
    
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    await tutorial.addRating(rating);
    
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
  addRating
};
