/**
 * Reviews Controller
 * HTTP handlers for review operations
 */

const reviewsService = require('./reviews.service');
const { successResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

/**
 * Get all reviews for a doctor
 */
const getDoctorReviews = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const data = await reviewsService.getDoctorReviews(doctorId);
    res.json(successResponse(data, `Found ${data.reviewCount} reviews`));
});

/**
 * Check if patient can review an appointment
 */
const canReviewAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const patientId = req.user.id; // From auth middleware

    const result = await reviewsService.canReview(appointmentId, patientId);
    res.json(successResponse(result));
});

/**
 * Create a new review
 */
const createReview = asyncHandler(async (req, res) => {
    const reviewData = {
        appointmentId: req.body.appointment_id,
        patientId: req.user.id, // From auth middleware
        doctorId: req.body.doctor_id,
        rating: req.body.rating,
        comment: req.body.comment
    };

    const review = await reviewsService.createReview(reviewData);
    res.status(201).json(successResponse(review, 'Review created successfully', 201));
});

module.exports = {
    getDoctorReviews,
    canReviewAppointment,
    createReview
};
