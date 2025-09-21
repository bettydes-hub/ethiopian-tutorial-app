const Category = require('../models/Category');
const Tutorial = require('../models/Tutorial');
const { formatResponse, formatPaginatedResponse, calculatePagination } = require('../utils/helpers');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { page, limit, isActive, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const pagination = calculatePagination(page, limit);
    
    // Build query
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get categories with pagination
    const categories = await Category.find(query)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Category.countDocuments(query);
    
    res.json(
      formatPaginatedResponse(categories, {
        ...pagination,
        total
      })
    );
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get categories')
    );
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    res.json(
      formatResponse(true, { category }, 'Category retrieved successfully')
    );
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get category')
    );
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Category with this name already exists')
      );
    }
    
    const category = new Category({
      name,
      description,
      color
    });
    
    await category.save();
    
    res.status(201).json(
      formatResponse(true, { category }, 'Category created successfully')
    );
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to create category')
    );
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    // Check if name is being changed and if it's already taken
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json(
          formatResponse(false, null, '', 'Category with this name already exists')
        );
      }
    }
    
    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    
    res.json(
      formatResponse(true, { category }, 'Category updated successfully')
    );
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update category')
    );
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    // Check if category has tutorials
    const tutorialCount = await Tutorial.countDocuments({ category: category.name });
    if (tutorialCount > 0) {
      return res.status(400).json(
        formatResponse(false, null, '', `Cannot delete category with ${tutorialCount} tutorials. Please move or delete the tutorials first.`)
      );
    }
    
    await Category.findByIdAndDelete(id);
    
    res.json(
      formatResponse(true, null, 'Category deleted successfully')
    );
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to delete category')
    );
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    // Get tutorial statistics
    const totalTutorials = await Tutorial.countDocuments({ category: category.name });
    const publishedTutorials = await Tutorial.countDocuments({ 
      category: category.name, 
      isPublished: true 
    });
    const draftTutorials = totalTutorials - publishedTutorials;
    
    // Get difficulty distribution
    const difficultyStats = await Tutorial.aggregate([
      { $match: { category: category.name } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    // Get average rating
    const ratingStats = await Tutorial.aggregate([
      { $match: { category: category.name, isPublished: true } },
      { $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: '$ratingCount' }
      }}
    ]);
    
    // Get recent tutorials
    const recentTutorials = await Tutorial.find({ category: category.name })
      .select('title createdAt isPublished')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const stats = {
      totalTutorials,
      publishedTutorials,
      draftTutorials,
      difficultyDistribution: difficultyStats,
      averageRating: ratingStats[0]?.averageRating || 0,
      totalRatings: ratingStats[0]?.totalRatings || 0,
      recentTutorials
    };
    
    res.json(
      formatResponse(true, { stats }, 'Category statistics retrieved successfully')
    );
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get category statistics')
    );
  }
};

// Get category with tutorials
const getCategoryWithTutorials = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, difficulty, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pagination = calculatePagination(page, limit);
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    // Build tutorial query
    const tutorialQuery = { category: category.name, isPublished: true };
    if (difficulty) {
      tutorialQuery.difficulty = difficulty;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get tutorials
    const tutorials = await Tutorial.find(tutorialQuery)
      .populate('teacherId', 'name email profilePicture')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    const total = await Tutorial.countDocuments(tutorialQuery);
    
    res.json(
      formatResponse(true, {
        category,
        tutorials: formatPaginatedResponse(tutorials, {
          ...pagination,
          total
        })
      }, 'Category with tutorials retrieved successfully')
    );
  } catch (error) {
    console.error('Get category with tutorials error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get category with tutorials')
    );
  }
};

// Toggle category active status
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json(
      formatResponse(true, { category }, `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`)
    );
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update category status')
    );
  }
};

// Get category list (for dropdowns)
const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name description color tutorialCount')
      .sort({ name: 1 });
    
    res.json(
      formatResponse(true, { categories }, 'Category list retrieved successfully')
    );
  } catch (error) {
    console.error('Get category list error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get category list')
    );
  }
};

// Update category tutorial count
const updateCategoryTutorialCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Category not found')
      );
    }
    
    await category.updateTutorialCount();
    
    res.json(
      formatResponse(true, { category }, 'Category tutorial count updated successfully')
    );
  } catch (error) {
    console.error('Update category tutorial count error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update category tutorial count')
    );
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryWithTutorials,
  toggleCategoryStatus,
  getCategoryList,
  updateCategoryTutorialCount
};
