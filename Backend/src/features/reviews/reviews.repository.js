/**
 * Reviews Repository
 * Data access layer for reviews operations
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all reviews for a specific doctor
 */
const getDoctorReviews = async (doctorId) => {
    try {
        const { data, error } = await supabase
            .from('active_doctor_reviews')
            .select(`
        *,
        patients!inner(fullName, patient_id)
      `)
            .eq('doctor_id', doctorId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error getting doctor reviews', { doctorId, error: error.message });
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Error in getDoctorReviews', { error: error.message });
        throw error;
    }
};

/**
 * Check if a patient can review an appointment
 */
const canReview = async (appointmentId, patientId) => {
    try {
        // Check if appointment exists and is completed
        const { data: appointment, error: aptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('appointment_id', appointmentId)
            .eq('patient_id', patientId)
            .single();

        if (aptError || !appointment) {
            return { canReview: false, reason: 'Appointment not found' };
        }

        if (appointment.status !== 'completed') {
            return { canReview: false, reason: 'Only completed appointments can be reviewed' };
        }

        // Check if review already exists for this appointment
        const { data: existingReview, error: revError } = await supabase
            .from('active_doctor_reviews')
            .select('*')
            .eq('appointment_id', appointmentId)
            .is('deleted_at', null)
            .maybeSingle();

        if (existingReview) {
            return { canReview: false, reason: 'Appointment already reviewed' };
        }

        return { canReview: true };
    } catch (error) {
        logger.error('Error in canReview', { error: error.message });
        throw error;
    }
};

/**
 * Create a new review
 */
const createReview = async (reviewData) => {
    try {
        const { data, error } = await supabase
            .from('active_doctor_reviews')
            .insert([{
                appointment_id: reviewData.appointmentId,
                patient_id: reviewData.patientId,
                doctor_id: reviewData.doctorId,
                rating: reviewData.rating,
                comment: reviewData.comment,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating review', { error: error.message });
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Error in createReview', { error: error.message });
        throw error;
    }
};

/**
 * Get review by ID
 */
const getReviewById = async (reviewId) => {
    try {
        const { data, error } = await supabase
            .from('active_doctor_reviews')
            .select('*')
            .eq('review_id', reviewId)
            .is('deleted_at', null)
            .single();

        if (error) {
            logger.error('Error getting review by ID', { reviewId, error: error.message });
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Error in getReviewById', { error: error.message });
        throw error;
    }
};

/**
 * Get average rating for a doctor
 */
const getDoctorAverageRating = async (doctorId) => {
    try {
        const { data, error } = await supabase
            .from('active_doctor_reviews')
            .select('rating')
            .eq('doctor_id', doctorId)
            .is('deleted_at', null);

        if (error) {
            logger.error('Error getting doctor average rating', { doctorId, error: error.message });
            throw error;
        }

        if (!data || data.length === 0) {
            return { averageRating: 0, reviewCount: 0 };
        }

        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / data.length).toFixed(1);

        return { averageRating: parseFloat(averageRating), reviewCount: data.length };
    } catch (error) {
        logger.error('Error in getDoctorAverageRating', { error: error.message });
        throw error;
    }
};

module.exports = {
    getDoctorReviews,
    canReview,
    createReview,
    getReviewById,
    getDoctorAverageRating
};
