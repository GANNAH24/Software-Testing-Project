// HTTP service - error handling wrapper
import apiClient from './api.service';

const http = {
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },
  post: async (url, data, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },
  put: async (url, data, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },
  patch: async (url, data, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  }
};

export default http;
