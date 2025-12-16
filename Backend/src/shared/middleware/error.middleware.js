/**
 * Error Handling Middleware
 * Centralized error handling
 */

const { errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  // CORS headers should already be set by CORS middleware, but ensure they're present
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.path}`, null, 404));
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = err.details;
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (err.code === '23505') { // Postgres unique violation
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.code === '23503') { // Postgres foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
  }

  res.status(statusCode).json(errorResponse(message, errors, statusCode));
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler
};
