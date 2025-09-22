import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const quizApi = axios.create({
  baseURL: `${API_BASE_URL}/quizzes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
quizApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const quizService = {
  // Get all quizzes
  getAllQuizzes: async (params = {}) => {
    try {
      const response = await quizApi.get('/', { params });
      return response.data.data || response.data.quizzes || response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    try {
      const response = await quizApi.get(`/${id}`);
      return response.data.data || response.data.quiz || response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Create new quiz (teacher only)
  createQuiz: async (quizData) => {
    try {
      const response = await quizApi.post('/', quizData);
      return response.data.data || response.data.quiz || response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz (teacher only)
  updateQuiz: async (id, quizData) => {
    try {
      const response = await quizApi.put(`/${id}`, quizData);
      return response.data.data || response.data.quiz || response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz (teacher/admin only)
  deleteQuiz: async (id) => {
    try {
      const response = await quizApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Get quizzes by tutorial
  getQuizzesByTutorial: async (tutorialId, params = {}) => {
    try {
      const response = await quizApi.get(`/tutorial/${tutorialId}`, { params });
      return response.data.data || response.data.quizzes || response.data;
    } catch (error) {
      console.error('Error fetching quizzes by tutorial:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId, answers) => {
    try {
      const response = await quizApi.post(`/attempt/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  // Get quiz attempts for user
  getUserQuizAttempts: async (userId, params = {}) => {
    try {
      const response = await quizApi.get(`/user/${userId}/attempts`, { params });
      return response.data.data || response.data.attempts || response.data;
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
      throw error;
    }
  },

  // Get quiz attempts for specific quiz
  getQuizAttempts: async (quizId, params = {}) => {
    try {
      const response = await quizApi.get(`/${quizId}/attempts`, { params });
      return response.data.data || response.data.attempts || response.data;
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw error;
    }
  },

  // Get quiz attempt by ID
  getQuizAttemptById: async (attemptId) => {
    try {
      const response = await quizApi.get(`/attempts/${attemptId}`);
      return response.data.data || response.data.attempt || response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt:', error);
      throw error;
    }
  },

  // Get quiz statistics
  getQuizStats: async (quizId) => {
    try {
      const response = await quizApi.get(`/${quizId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      throw error;
    }
  },

  // Start quiz attempt
  startQuizAttempt: async (quizId) => {
    try {
      const response = await quizApi.post(`/${quizId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },

  // Toggle publish status
  togglePublishStatus: async (quizId) => {
    try {
      const response = await quizApi.patch(`/${quizId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      throw error;
    }
  },
};

export default quizApi;
