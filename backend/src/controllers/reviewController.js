const { formatResponse } = require('../utils/helpers');
const Review = require('../models/Review');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');

// Get reviews for a tutorial
const getTutorialReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const reviews = await Review.findAndCountAll({
      where: { tutorial_id: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_picture']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(
      formatResponse(true, {
        reviews: reviews.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reviews.count,
          pages: Math.ceil(reviews.count / limit)
        }
      }, 'Reviews retrieved successfully')
    );
  } catch (error) {
    console.error('Get tutorial reviews error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to get reviews')
    );
  }
};

// Create a review
const createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Rating must be between 1 and 5')
      );
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json(
        formatResponse(false, null, '', 'Comment is required')
      );
    }
    
    // Check if tutorial exists
    const tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Tutorial not found')
      );
    }
    
    // Check if user already reviewed this tutorial
    const existingReview = await Review.findOne({
      where: { 
        user_id: userId, 
        tutorial_id: id 
      }
    });
    
    if (existingReview) {
      return res.status(409).json(
        formatResponse(false, null, '', 'You have already reviewed this tutorial')
      );
    }
    
    // Create review
    const review = await Review.create({
      user_id: userId,
      tutorial_id: id,
      rating: parseInt(rating),
      comment: comment.trim()
    });
    
    // Update tutorial rating
    const newRatingCount = tutorial.rating_count + 1;
    const newRating = ((tutorial.rating * tutorial.rating_count) + parseInt(rating)) / newRatingCount;
    
    await tutorial.update({
      rating: newRating,
      rating_count: newRatingCount
    });
    
    // Get the review with user data
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_picture']
      }]
    });
    
    res.status(201).json(
      formatResponse(true, { review: reviewWithUser }, 'Review created successfully')
    );
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to create review')
    );
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    const review = await Review.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });
    
    if (!review) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Review not found')
      );
    }
    
    const oldRating = review.rating;
    
    // Update review
    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment
    });
    
    // Update tutorial rating if rating changed
    if (rating && rating !== oldRating) {
      const tutorial = await Tutorial.findByPk(review.tutorial_id);
      if (tutorial) {
        const newRating = ((tutorial.rating * tutorial.rating_count) - oldRating + parseInt(rating)) / tutorial.rating_count;
        await tutorial.update({ rating: newRating });
      }
    }
    
    res.json(
      formatResponse(true, { review }, 'Review updated successfully')
    );
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to update review')
    );
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const review = await Review.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });
    
    if (!review) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Review not found')
      );
    }
    
    // Update tutorial rating
    const tutorial = await Tutorial.findByPk(review.tutorial_id);
    if (tutorial) {
      const newRatingCount = tutorial.rating_count - 1;
      if (newRatingCount > 0) {
        const newRating = ((tutorial.rating * tutorial.rating_count) - review.rating) / newRatingCount;
        await tutorial.update({
          rating: newRating,
          rating_count: newRatingCount
        });
      } else {
        await tutorial.update({
          rating: 0,
          rating_count: 0
        });
      }
    }
    
    await review.destroy();
    
    res.json(
      formatResponse(true, null, 'Review deleted successfully')
    );
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to delete review')
    );
  }
};

// Get user's review for a specific tutorial
const getUserReview = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { 
        tutorial_id: tutorialId,
        user_id: userId
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'profile_picture']
      }]
    });

    if (!review) {
      return res.status(404).json(
        formatResponse(false, null, '', 'Review not found')
      );
    }

    res.json(
      formatResponse(true, { review }, 'User review fetched successfully')
    );
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json(
      formatResponse(false, null, '', 'Failed to fetch user review')
    );
  }
};

module.exports = {
  getTutorialReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReview
};
