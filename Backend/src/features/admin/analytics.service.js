/**
 * Analytics Service
 * Business logic for analytics operations
 */

const analyticsRepository = require('./analytics.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Get specialty distribution analytics
 */
const getSpecialtyDistribution = async () => {
    try {
        const specialties = await analyticsRepository.getDoctorsBySpecialty();

        // Calculate total and percentages
        const total = specialties.reduce((sum, item) => sum + item.value, 0);
        const withPercentages = specialties.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
        }));

        return {
            data: withPercentages,
            total
        };
    } catch (error) {
        logger.error('Error in getSpecialtyDistribution service', { error: error.message });
        throw error;
    }
};

/**
 * Get top performing doctors
 */
const getTopPerformingDoctors = async (limit = 10) => {
    try {
        const topDoctors = await analyticsRepository.getTopDoctors(limit);

        return {
            data: topDoctors,
            count: topDoctors.length
        };
    } catch (error) {
        logger.error('Error in getTopPerformingDoctors service', { error: error.message });
        throw error;
    }
};

/**
 * Get comprehensive analytics overview
 */
const getAnalyticsOverview = async () => {
    try {
        const [specialtyDist, topDoctors, appointmentStats] = await Promise.all([
            getSpecialtyDistribution(),
            getTopPerformingDoctors(5),
            analyticsRepository.getAppointmentStats()
        ]);

        return {
            specialtyDistribution: specialtyDist,
            topDoctors: topDoctors,
            appointmentStats: appointmentStats
        };
    } catch (error) {
        logger.error('Error in getAnalyticsOverview service', { error: error.message });
        throw error;
    }
};

module.exports = {
    getSpecialtyDistribution,
    getTopPerformingDoctors,
    getAnalyticsOverview
};
