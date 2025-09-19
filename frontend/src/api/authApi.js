import axios from 'axios';
import { mockApiResponses } from '../data/mockData';

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
    // For testing, simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Student login
        if (credentials.email === 'alemu@example.com' && credentials.password === 'password') {
          resolve(mockApiResponses.login.student);
        }
        // Teacher login
        else if (credentials.email === 'meseret@example.com' && credentials.password === 'password') {
          resolve(mockApiResponses.login.teacher);
        }
        // Admin login
        else if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          resolve(mockApiResponses.login.admin);
        }
        // Legacy test login (defaults to student)
        else if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          resolve(mockApiResponses.login.student);
        }
        else {
          reject({ response: { data: mockApiResponses.login.error } });
        }
      }, 1000);
    });
  },

  // Register user
  register: async (userData) => {
    // For testing, simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email !== 'existing@example.com') {
          resolve(mockApiResponses.register.success);
        } else {
          reject({ response: { data: mockApiResponses.register.error } });
        }
      }, 1000);
    });
  },

  // Logout user
  logout: async () => {
    const response = await authApi.post('/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    // For testing, return mock user data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockApiResponses.login.student.user), 300);
    });
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
