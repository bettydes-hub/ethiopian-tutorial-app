import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const reviewApi = axios.create({
  baseURL: `${API_BASE_URL}/reviews`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
reviewApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewService = {
  // Get reviews for a tutorial
  getTutorialReviews: async (tutorialId, params = {}) => {
    try {
      const response = await reviewApi.get(`/tutorial/${tutorialId}`, { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching tutorial reviews:', error);
      throw error;
    }
  },

  // Get user's review for a specific tutorial
  getUserReview: async (tutorialId) => {
    try {
      const response = await reviewApi.get(`/user/${tutorialId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user review:', error);
      throw error;
    }
  },

  // Create a review
  createReview: async (tutorialId, reviewData) => {
    try {
      const response = await reviewApi.post(`/tutorial/${tutorialId}`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await reviewApi.put(`/${reviewId}`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await reviewApi.delete(`/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

export default reviewApi;
