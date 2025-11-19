// LocalStorage utilities for consistent storage access
import { STORAGE_KEYS } from '../../config/constants';

export const storage = {
  // Auth token
  getToken: () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),

  // User data
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(STORAGE_KEYS.USER_DATA),

  // Theme
  getTheme: () => localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
  setTheme: (theme) => localStorage.setItem(STORAGE_KEYS.THEME, theme),

  // Clear all
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
};

export default storage;
