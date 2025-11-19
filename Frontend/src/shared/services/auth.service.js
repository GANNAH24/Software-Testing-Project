import apiClient, { API_ENDPOINTS } from './api.service';
export const authService = {
  login: async (email, password) => await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),
  register: async (userData) => await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  logout: async () => await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  // Backend exposes /auth/me not /auth/verify
  getCurrentUser: async () => await apiClient.get('/auth/me'),
  changePassword: async (oldPassword, newPassword) => await apiClient.post('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: async (email) => await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: async (token, newPassword) => await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password: newPassword })
};
export default authService;
