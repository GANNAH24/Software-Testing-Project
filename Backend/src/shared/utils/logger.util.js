/**
 * Logger Utility
 * Simple logging utility for the application
 */

const config = require('../../config/environment');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LOG_LEVELS[config.LOG_LEVEL] || LOG_LEVELS.info;

/**
 * Format log message
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`;
};

/**
 * Log error
 */
const error = (message, meta = {}) => {
  if (currentLevel >= LOG_LEVELS.error) {
    console.error(formatMessage('error', message, meta));
  }
};

/**
 * Log warning
 */
const warn = (message, meta = {}) => {
  if (currentLevel >= LOG_LEVELS.warn) {
    console.warn(formatMessage('warn', message, meta));
  }
};

/**
 * Log info
 */
const info = (message, meta = {}) => {
  if (currentLevel >= LOG_LEVELS.info) {
    console.log(formatMessage('info', message, meta));
  }
};

/**
 * Log debug
 */
const debug = (message, meta = {}) => {
  if (currentLevel >= LOG_LEVELS.debug) {
    console.log(formatMessage('debug', message, meta));
  }
};

module.exports = {
  error,
  warn,
  info,
  debug
};
