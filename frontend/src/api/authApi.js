import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await authApi.post('/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await authApi.post('/register', userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await authApi.post('/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await authApi.get('/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await authApi.post('/refresh');
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await authApi.post('/change-password', passwordData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await authApi.put('/profile', profileData);
    return response.data;
  },
};

export default authApi;
