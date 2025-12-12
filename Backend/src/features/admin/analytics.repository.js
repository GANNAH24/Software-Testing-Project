/**
 * Analytics Repository
 * Data access layer for analytics operations
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Get doctors grouped by specialty
 */
const getDoctorsBySpecialty = async () => {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('specialty')
            .is('deleted_at', null);

        if (error) {
            logger.error('Error getting doctors by specialty', { error: error.message });
            throw error;
        }

        // Group and count doctors by specialty
        const specialtyCounts = {};
        data.forEach(doctor => {
            const specialty = doctor.specialty || 'Unspecified';
            specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
        });

        // Convert to array format for charts
        return Object.entries(specialtyCounts).map(([name, count]) => ({
            name,
            value: count
        }));
    } catch (error) {
        logger.error('Error in getDoctorsBySpecialty', { error: error.message });
        throw error;
    }
};

/**
 * Get top doctors by completed appointments
 */
const getTopDoctors = async (limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('doctor_id, doctors!inner(name, specialty)')
            .eq('status', 'completed');

        if (error) {
            logger.error('Error getting top doctors', { error: error.message });
            throw error;
        }

        // Count completed appointments per doctor
        const doctorCounts = {};
        data.forEach(appointment => {
            const doctorId = appointment.doctor_id;
            const doctorName = appointment.doctors?.name || 'Unknown';
            const doctorSpecialty = appointment.doctors?.specialty || 'General';

            if (!doctorCounts[doctorId]) {
                doctorCounts[doctorId] = {
                    doctor_id: doctorId,
                    name: doctorName,
                    specialty: doctorSpecialty,
                    completedAppointments: 0
                };
            }
            doctorCounts[doctorId].completedAppointments++;
        });

        // Convert to array and sort by completed appointments
        const topDoctors = Object.values(doctorCounts)
            .sort((a, b) => b.completedAppointments - a.completedAppointments)
            .slice(0, limit);

        return topDoctors;
    } catch (error) {
        logger.error('Error in getTopDoctors', { error: error.message });
        throw error;
    }
};

/**
 * Get appointment statistics by status
 */
const getAppointmentStats = async () => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('status');

        if (error) {
            logger.error('Error getting appointment stats', { error: error.message });
            throw error;
        }

        // Count appointments by status
        const statusCounts = {};
        data.forEach(appointment => {
            const status = appointment.status || 'unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return statusCounts;
    } catch (error) {
        logger.error('Error in getAppointmentStats', { error: error.message });
        throw error;
    }
};

module.exports = {
    getDoctorsBySpecialty,
    getTopDoctors,
    getAppointmentStats
};
