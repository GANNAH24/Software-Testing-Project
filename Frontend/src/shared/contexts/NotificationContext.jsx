import React, { createContext, useContext, useState } from 'react';
import { showSuccess, showError, showInfo } from '../components/Toast';
const NotificationContext = createContext(null);
export const NotificationProvider = ({ children }) => {
  const success = (message) => showSuccess(message);
  const error = (message) => showError(message);
  const info = (message) => showInfo(message);
  return <NotificationContext.Provider value={{ success, error, info }}>{children}</NotificationContext.Provider>;
};
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
export default NotificationContext;
