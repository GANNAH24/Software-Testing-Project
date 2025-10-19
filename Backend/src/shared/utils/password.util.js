/**
 * Password Utilities
 * Password validation and hashing
 */

const config = require('../../config/environment');

/**
 * Password requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: config.PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get password requirements
 * @returns {Object} - Password requirements
 */
const getPasswordRequirements = () => {
  return {
    minLength: PASSWORD_REQUIREMENTS.minLength,
    requireUppercase: PASSWORD_REQUIREMENTS.requireUppercase,
    requireLowercase: PASSWORD_REQUIREMENTS.requireLowercase,
    requireNumbers: PASSWORD_REQUIREMENTS.requireNumbers,
    requireSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars,
    specialChars: PASSWORD_REQUIREMENTS.specialChars,
    description: [
      `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
      'At least one uppercase letter (A-Z)',
      'At least one lowercase letter (a-z)',
      'At least one number (0-9)',
      `At least one special character (${PASSWORD_REQUIREMENTS.specialChars})`
    ]
  };
};

module.exports = {
  validatePassword,
  getPasswordRequirements,
  PASSWORD_REQUIREMENTS
};
