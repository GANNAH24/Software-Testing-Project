/**
 * Auth Routes
 * API endpoints for authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { requireAuth } = require('../../shared/middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/password-requirements', authController.getPasswordRequirements);

// Protected routes (require authentication)
router.post('/logout', requireAuth(), authController.logout);
router.get('/me', requireAuth(), authController.getCurrentUser);
router.put('/profile', requireAuth(), authController.updateProfile);
router.post('/change-password', requireAuth(), authController.changePassword);

module.exports = router;
