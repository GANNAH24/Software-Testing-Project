// Validation utilities

export const validators = {
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  isValidPassword: (password) => {
    if (password.length < 8) return false;
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  },
  getPasswordStrength: (password) => {
    if (!password || password.length < 8) return 'weak';
    let strength = 0;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    if (password.length >= 12) strength++;
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  },
  isValidPhone: (phone) => /^\+?[\d\s-()]{10,}$/.test(phone),
  isRequired: (value) => typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined,
  minLength: (value, min) => value && value.length >= min,
  maxLength: (value, max) => value && value.length <= max
};
export default validators;
