import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
const ThemeContext = createContext(null);
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(storage.getTheme());
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.setTheme(theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
export default ThemeContext;
