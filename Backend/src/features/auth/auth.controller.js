/**
 * Auth Controller
 * Presentation layer for authentication
 */

const authService = require('./auth.service');
const { getPasswordRequirements } = require('../../shared/utils/password.util');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, role, fullName, specialty, phoneNumber, ...additionalData } = req.body;

  const data = {
    fullName,
    specialty,
    phoneNumber,
    ...additionalData
  };

  const result = await authService.register(email, password, role, data);

  res.status(201).json(successResponse({
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.profile.role,
      fullName: result.profile.full_name
    },
    token: result.session.access_token
  }, 'Registration successful', 201));
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(errorResponse('Email and password are required', null, 400));
  }

  const result = await authService.login(email, password);

  res.json(successResponse({
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.profile.role,
      fullName: result.profile.full_name
    },
    token: result.session.access_token,
    roleData: result.roleData
  }, 'Login successful'));
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.substring(7);
  await authService.logout(token);

  res.json(successResponse(null, 'Logout successful'));
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id);

  res.json(successResponse({
    id: req.user.id,
    email: req.user.email,
    role: result.profile.role,
    fullName: result.profile.full_name,
    profile: result.profile,
    roleData: result.roleData
  }));
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json(errorResponse('Old password and new password are required', null, 400));
  }

  await authService.changePassword(req.user.id, oldPassword, newPassword);

  res.json(successResponse(null, 'Password changed successfully'));
});

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(errorResponse('Email is required', null, 400));
  }

  await authService.forgotPassword(email);

  res.json(successResponse(null, 'Password reset email sent'));
});

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json(errorResponse('Token and new password are required', null, 400));
  }

  await authService.resetPassword(token, newPassword);

  res.json(successResponse(null, 'Password reset successful'));
});

/**
 * Get password requirements
 * GET /api/v1/auth/password-requirements
 */
const getPasswordRequirementsController = asyncHandler(async (req, res) => {
  const requirements = getPasswordRequirements();
  res.json(successResponse(requirements));
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getPasswordRequirements: getPasswordRequirementsController
};
