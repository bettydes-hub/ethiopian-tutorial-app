import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  getAllTutorials: async () => {
    const response = await tutorialApi.get('/');
    return response.data;
  },

  // Get tutorial by ID
  getTutorialById: async (id) => {
    const response = await tutorialApi.get(`/${id}`);
    return response.data;
  },

  // Create new tutorial (admin/teacher only)
  createTutorial: async (tutorialData) => {
    const response = await tutorialApi.post('/', tutorialData);
    return response.data;
  },

  // Update tutorial (admin/teacher only)
  updateTutorial: async (id, tutorialData) => {
    const response = await tutorialApi.put(`/${id}`, tutorialData);
    return response.data;
  },

  // Delete tutorial (admin only)
  deleteTutorial: async (id) => {
    const response = await tutorialApi.delete(`/${id}`);
    return response.data;
  },

  // Get tutorials by category
  getTutorialsByCategory: async (category) => {
    const response = await tutorialApi.get(`/category/${category}`);
    return response.data;
  },

  // Get user's progress
  getUserProgress: async (userId) => {
    const response = await tutorialApi.get(`/progress/${userId}`);
    return response.data;
  },

  // Update user progress
  updateProgress: async (tutorialId, progressData) => {
    const response = await tutorialApi.post(`/${tutorialId}/progress`, progressData);
    return response.data;
  },
};

export default tutorialApi;
