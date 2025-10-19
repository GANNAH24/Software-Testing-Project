/**
 * Response Utilities
 * Standardized API response format
 */

/**
 * Success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Error response
 * @param {string} message - Error message
 * @param {*} errors - Error details
 * @param {number} statusCode - HTTP status code
 */
const errorResponse = (message = 'Error', errors = null, statusCode = 500) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validation error response
 * @param {*} errors - Validation errors
 */
const validationErrorResponse = (errors) => {
  return errorResponse('Validation failed', errors, 400);
};

/**
 * Not found response
 * @param {string} resource - Resource name
 */
const notFoundResponse = (resource = 'Resource') => {
  return errorResponse(`${resource} not found`, null, 404);
};

/**
 * Unauthorized response
 */
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(message, null, 401);
};

/**
 * Forbidden response
 */
const forbiddenResponse = (message = 'Forbidden access') => {
  return errorResponse(message, null, 403);
};

/**
 * Paginated response
 * @param {Array} data - Array of data
 * @param {Object} pagination - Pagination info
 */
const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    },
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  paginatedResponse
};
