import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const uploadApi = axios.create({
  baseURL: `${API_BASE_URL}/upload`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add token to requests
uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  // Upload video file
  uploadVideo: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await uploadApi.post('/video', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Upload PDF file
  uploadPDF: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await uploadApi.post('/pdf', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },

  // Upload image file
  uploadImage: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadApi.post('/image', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete uploaded file
  deleteFile: async (fileUrl) => {
    try {
      const response = await uploadApi.delete('/', { 
        data: { fileUrl } 
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get upload progress (for large files)
  getUploadProgress: async (uploadId) => {
    try {
      const response = await uploadApi.get(`/progress/${uploadId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting upload progress:', error);
      throw error;
    }
  },
};

export default uploadApi;
