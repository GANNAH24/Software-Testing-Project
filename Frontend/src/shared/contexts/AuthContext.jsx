import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import apiClient from '../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth...');
      const token = storage.getToken();
      const savedUser = storage.getUser();
      console.log('Stored auth:', { hasToken: !!token, user: savedUser });
      
      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        console.log('User authenticated from storage:', savedUser);
      } else {
        console.log('No stored auth found');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      console.log('Login response:', response);
      
      // API interceptor returns response.data which is the backend's successResponse
      // Structure: { success: true, data: { user, token, roleData }, message, timestamp }
      let userData, token;
      
      if (response.data && response.data.user && response.data.token) {
        // Response has nested data object
        userData = response.data.user;
        token = response.data.token;
      } else if (response.user && response.token) {
        // Response is flat (already unwrapped)
        userData = response.user;
        token = response.token;
      } else {
        console.error('Invalid response structure:', response);
        return { success: false, error: 'Invalid server response' };
      }
      
      if (!userData || !token) {
        console.error('Missing user or token:', { userData, token });
        return { success: false, error: 'Invalid server response - missing credentials' };
      }
      
      console.log('Saving to localStorage:', { user: userData, token: token.substring(0, 20) + '...' });
      storage.setToken(token);
      storage.setUser(userData);
      
      // Wait a tick to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Auth state updated - user should be logged in');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      // API interceptor returns response.data which contains { success, data: { user, token }, message }
      const { user: newUser, token } = response.data;
      // Don't auto-login after registration - user should be redirected to login page
      return { success: true, user: newUser, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.clearAll();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  const value = { user, loading, isAuthenticated, login, register, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

export default AuthContext;
