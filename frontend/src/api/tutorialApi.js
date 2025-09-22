import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const tutorialApi = axios.create({
  baseURL: `${API_BASE_URL}/tutorials`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
tutorialApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tutorialService = {
  // Get all tutorials
  getAllTutorials: async (params = {}) => {
    try {
      const response = await tutorialApi.get('/', { params });
      return response.data.data || response.data.tutorials || response.data;
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      throw error;
    }
  },

  // Get tutorial by ID
  getTutorialById: async (id) => {
    try {
      const response = await tutorialApi.get(`/${id}`);
      return response.data.data || response.data.tutorial || response.data;
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      throw error;
    }
  },

  // Create new tutorial (admin/teacher only)
  createTutorial: async (tutorialData) => {
    try {
      const response = await tutorialApi.post('/', tutorialData);
      return response.data.data || response.data.tutorial || response.data;
    } catch (error) {
      console.error('Error creating tutorial:', error);
      throw error;
    }
  },

  // Update tutorial (admin/teacher only)
  updateTutorial: async (id, tutorialData) => {
    try {
      const response = await tutorialApi.put(`/${id}`, tutorialData);
      return response.data.data || response.data.tutorial || response.data;
    } catch (error) {
      console.error('Error updating tutorial:', error);
      throw error;
    }
  },

  // Delete tutorial (admin only)
  deleteTutorial: async (id) => {
    try {
      const response = await tutorialApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      throw error;
    }
  },

  // Get tutorials by category
  getTutorialsByCategory: async (category, params = {}) => {
    try {
      const response = await tutorialApi.get(`/category/${category}`, { params });
      return response.data.data || response.data.tutorials || response.data;
    } catch (error) {
      console.error('Error fetching tutorials by category:', error);
      throw error;
    }
  },

  // Get user's progress
  getUserProgress: async (userId) => {
    try {
      const response = await tutorialApi.get(`/user/${userId}/progress`);
      return response.data.data || response.data.progress || response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  },

  // Update user progress
  updateProgress: async (tutorialId, progressData) => {
    try {
      const response = await tutorialApi.post(`/${tutorialId}/progress`, progressData);
      return response.data.data || response.data.progress || response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Search tutorials
  searchTutorials: async (query, params = {}) => {
    try {
      const response = await tutorialApi.get('/search', { 
        params: { q: query, ...params } 
      });
      return response.data.data || response.data.tutorials || response.data;
    } catch (error) {
      console.error('Error searching tutorials:', error);
      throw error;
    }
  },

  // Get all user progress
  getAllUserProgress: async (params = {}) => {
    try {
      const response = await tutorialApi.get('/user/progress', { params });
      return response.data.data || response.data.progress || response.data;
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      throw error;
    }
  },

  // Get tutorial statistics
  getTutorialStats: async (tutorialId) => {
    try {
      const response = await tutorialApi.get(`/${tutorialId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutorial stats:', error);
      throw error;
    }
  },

  // Toggle publish status
  togglePublishStatus: async (tutorialId) => {
    try {
      const response = await tutorialApi.patch(`/${tutorialId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      throw error;
    }
  },

  // Add rating to tutorial
  addRating: async (tutorialId, rating) => {
    try {
      const response = await tutorialApi.post(`/${tutorialId}/rating`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  },
};

export default tutorialApi;
