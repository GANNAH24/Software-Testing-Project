import axios from 'axios';
import apiConfig, { API_ENDPOINTS } from '../../config/api.config';
import { API_BASE_URL, STORAGE_KEYS } from '../../config/constants';

// Prefer environment base URL (may already contain version) else fallback to config
const apiClient = axios.create({
  baseURL: API_BASE_URL || apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added auth token to request:', config.url);
    } else {
      console.warn('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data, // Backend wraps in {success, data, message}, so we return the whole response.data
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Convenience endpoint export
export { API_ENDPOINTS };
export default apiClient;

// Example helper methods
export const get = (url, config) => apiClient.get(url, config);
export const post = (url, data, config) => apiClient.post(url, data, config);
export const put = (url, data, config) => apiClient.put(url, data, config);
export const del = (url, config) => apiClient.delete(url, config);
