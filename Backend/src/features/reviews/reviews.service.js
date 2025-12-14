/**
 * Reviews Service
 * Business logic for reviews operations
 */

const reviewsRepository = require('./reviews.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all reviews for a doctor with average rating
 */
const getDoctorReviews = async (doctorId) => {
    try {
        const [reviews, ratingData] = await Promise.all([
            reviewsRepository.getDoctorReviews(doctorId),
            reviewsRepository.getDoctorAverageRating(doctorId)
        ]);

        return {
            reviews,
            averageRating: ratingData.averageRating,
            reviewCount: ratingData.reviewCount
        };
    } catch (error) {
        logger.error('Error in getDoctorReviews service', { error: error.message });
        throw error;
    }
};

/**
 * Check if patient can review an appointment
 */
const canReview = async (appointmentId, patientId) => {
    try {
        return await reviewsRepository.canReview(appointmentId, patientId);
    } catch (error) {
        logger.error('Error in canReview service', { error: error.message });
        throw error;
    }
};

/**
 * Create a new review with validation
 */
const createReview = async (reviewData) => {
    try {
        // Validate rating
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Check if patient can review this appointment
        const reviewCheck = await reviewsRepository.canReview(
            reviewData.appointmentId,
            reviewData.patientId
        );

        if (!reviewCheck.canReview) {
            throw new Error(reviewCheck.reason);
        }

        // Create the review
        const review = await reviewsRepository.createReview(reviewData);

        return review;
    } catch (error) {
        logger.error('Error in createReview service', { error: error.message });
        throw error;
    }
};

module.exports = {
    getDoctorReviews,
    canReview,
    createReview
};
