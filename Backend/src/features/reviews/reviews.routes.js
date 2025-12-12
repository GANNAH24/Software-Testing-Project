/**
 * Reviews Routes
 * Routes for review operations
 */

const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const { requireAuth } = require('../../shared/middleware/auth.middleware');

// Get all reviews for a specific doctor (public)
router.get('/doctor/:doctorId', reviewsController.getDoctorReviews);

// Check if patient can review an appointment (requires auth)
router.get('/can-review/:appointmentId', requireAuth(), reviewsController.canReviewAppointment);

// Create a new review (requires auth - patient only)
router.post('/', requireAuth(), reviewsController.createReview);

module.exports = router;
