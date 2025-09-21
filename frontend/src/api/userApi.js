import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userApi = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    try {
      const response = await userApi.get('/', { params });
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await userApi.get(`/${id}`);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await userApi.post('/', userData);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await userApi.put(`/${id}`, userData);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await userApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Block user (admin only)
  blockUser: async (id) => {
    try {
      const response = await userApi.post(`/${id}/block`);
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // Unblock user (admin only)
  unblockUser: async (id) => {
    try {
      const response = await userApi.post(`/${id}/unblock`);
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  // Approve teacher (admin only)
  approveTeacher: async (id) => {
    try {
      const response = await userApi.post(`/${id}/approve-teacher`);
      return response.data;
    } catch (error) {
      console.error('Error approving teacher:', error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role, params = {}) => {
    try {
      const response = await userApi.get(`/role/${role}`, { params });
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // Get pending teachers
  getPendingTeachers: async (params = {}) => {
    try {
      const response = await userApi.get('/pending-teachers', { params });
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      throw error;
    }
  },

  // Get blocked users
  getBlockedUsers: async (params = {}) => {
    try {
      const response = await userApi.get('/blocked', { params });
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  },
};

export default userApi;
