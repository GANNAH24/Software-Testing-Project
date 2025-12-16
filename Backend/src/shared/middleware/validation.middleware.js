/**
 * Validation Middleware
 * Request validation using schemas
 */

const { validationErrorResponse } = require('../utils/response.util');

/**
 * Validate request body against schema
 * @param {Function} schemaValidator - Validation function
 */
const validateBody = (schemaValidator) => {
  return (req, res, next) => {
    const { error, value } = schemaValidator(req.body);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json(validationErrorResponse(errors));
    }

    req.body = value; // Use validated and sanitized value
    next();
  };
};

/**
 * Validate request params against schema
 * @param {Function} schemaValidator - Validation function
 */
const validateParams = (schemaValidator) => {
  return (req, res, next) => {
    const { error, value } = schemaValidator(req.params);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json(validationErrorResponse(errors));
    }

    req.params = value;
    next();
  };
};

/**
 * Validate request query against schema
 * @param {Function} schemaValidator - Validation function
 */
const validateQuery = (schemaValidator) => {
  return (req, res, next) => {
    const { error, value } = schemaValidator(req.query);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json(validationErrorResponse(errors));
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery
};
