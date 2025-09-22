import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const categoryApi = axios.create({
  baseURL: `${API_BASE_URL}/categories`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
categoryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const categoryService = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await categoryApi.get('/', { params });
      return response.data.data || response.data.categories || response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await categoryApi.get(`/${id}`);
      return response.data.data || response.data.category || response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create new category (admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await categoryApi.post('/', categoryData);
      return response.data.data || response.data.category || response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await categoryApi.put(`/${id}`, categoryData);
      return response.data.data || response.data.category || response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    try {
      const response = await categoryApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get category statistics
  getCategoryStats: async (id) => {
    try {
      const response = await categoryApi.get(`/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // Get category list (simplified)
  getCategoryList: async () => {
    try {
      const response = await categoryApi.get('/list');
      return response.data.data || response.data.categories || response.data;
    } catch (error) {
      console.error('Error fetching category list:', error);
      throw error;
    }
  },

  // Get category with tutorials
  getCategoryWithTutorials: async (id, params = {}) => {
    try {
      const response = await categoryApi.get(`/${id}/tutorials`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching category with tutorials:', error);
      throw error;
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (id) => {
    try {
      const response = await categoryApi.patch(`/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  },

  // Update category tutorial count
  updateCategoryTutorialCount: async (id) => {
    try {
      const response = await categoryApi.patch(`/${id}/update-count`);
      return response.data;
    } catch (error) {
      console.error('Error updating category tutorial count:', error);
      throw error;
    }
  },
};

export default categoryApi;
