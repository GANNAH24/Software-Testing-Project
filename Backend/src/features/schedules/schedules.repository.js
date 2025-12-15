/**
 * Schedules Repository
 * Data access layer for doctor schedules
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Find all schedules for a doctor
 */
const findAllByDoctor = async (doctorId, filters = {}) => {
    let query = supabase
        .from('doctor_schedules')
        .select('*');
    
    // Filter by doctor ID if provided
    if (doctorId) {
        query = query.eq('doctor_id', doctorId);
    }

    // Filter by specific date
    if (filters.date) {
        query = query.eq('date', filters.date);
    }

    // Filter by date range
    if (filters.startDate) {
        query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
        query = query.lte('date', filters.endDate);
    }
    
    // If no specific date or date range specified, only show future schedules by default
    if (!filters.date && !filters.startDate && !filters.endDate && !filters.includePast) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date', today);
    }

    // Filter by availability
    if (filters.isAvailable !== undefined) {
        query = query.eq('is_available', filters.isAvailable);
    }

    query = query.order('date', { ascending: true })
        .order('time_slot', { ascending: true });

    const { data, error } = await query;

    if (error) {
        logger.error('Error finding doctor schedules', { doctorId, error: error.message });
        throw error;
    }

    return data || [];
};

/**
 * Find schedule by ID
 */
const findById = async (scheduleId) => {
    const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

    if (error && error.code !== 'PGRST116') {
        logger.error('Error finding schedule', { scheduleId, error: error.message });
        throw error;
    }

    return data;
};

/**
 * Create new schedule
 */
const create = async (scheduleData) => {
    const { data, error } = await supabase
        .from('doctor_schedules')
        .insert([{
            doctor_id: scheduleData.doctorId,
            date: scheduleData.date,
            time_slot: scheduleData.timeSlot,
            is_available: scheduleData.isAvailable ?? true
        }])
        .select()
        .single();

    if (error) {
        logger.error('Error creating schedule', { error: error.message });
        throw error;
    }

    return data;
};

/**
 * Update schedule
 */
const update = async (scheduleId, updates) => {
    // Convert camelCase to snake_case for database
    const dbUpdates = {};
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.timeSlot) dbUpdates.time_slot = updates.timeSlot;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.notes) dbUpdates.notes = updates.notes;
    
    const { data, error } = await supabase
        .from('doctor_schedules')
        .update(dbUpdates)
        .eq('schedule_id', scheduleId)
        .select()
        .single();

    if (error) {
        logger.error('Error updating schedule', { scheduleId, error: error.message });
        throw error;
    }

    return data;
};

/**
 * Delete schedule
 */
const remove = async (scheduleId) => {
    const { data, error } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('schedule_id', scheduleId)
        .select()
        .single();

    if (error) {
        logger.error('Error deleting schedule', { scheduleId, error: error.message });
        throw error;
    }

    return data;
};

/**
 * Get weekly schedule
 */
const getWeeklySchedule = async (doctorId, weekStart) => {
    const startDate = new Date(weekStart);
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', startDate.toISOString())
        .lt('date', weekEnd.toISOString())
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true });

    if (error) {
        logger.error('Error getting weekly schedule', { doctorId, error: error.message });
        throw error;
    }

    return data;
};

/**
 * Get daily schedule
 */
const getDailySchedule = async (doctorId, date) => {
    const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .order('time_slot', { ascending: true });

    if (error) {
        logger.error('Error getting daily schedule', { doctorId, error: error.message });
        throw error;
    }

    return data;
};

/**
 * Check for schedule conflicts
 */
const checkConflicts = async (doctorId, date, timeSlot, excludeScheduleId = null) => {
    let query = supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date);

    if (excludeScheduleId) {
        query = query.neq('schedule_id', excludeScheduleId);
    }

    const { data, error } = await query;

    if (error) {
        logger.error('Error checking schedule conflicts', { doctorId, error: error.message });
        throw error;
    }

    // Check for time overlaps
    return data.some(schedule => {
        // Support two possible schema variants:
        // 1) schedule.time_slot exists as "HH:mm-HH:mm"
        // 2) schedule.start_time and schedule.end_time exist (time or text like '09:00:00')

        let existingStartStr = null;
        let existingEndStr = null;

        if (schedule.time_slot) {
            // expected format: '09:00-10:00'
            const parts = schedule.time_slot.split('-');
            if (parts.length === 2) {
                existingStartStr = parts[0].trim();
                existingEndStr = parts[1].trim();
            } else {
                return false; // unrecognized format, skip
            }
        } else if (schedule.start_time && schedule.end_time) {
            // start_time/end_time may be '09:00:00' or '09:00'
            existingStartStr = schedule.start_time.toString().slice(0, 5);
            existingEndStr = schedule.end_time.toString().slice(0, 5);
        } else {
            // No usable time info on this record; skip it
            return false;
        }

        // New slot parsing: support 'HH:mm-HH:mm' or 'HH:MM:SS-HH:MM:SS'
        const newParts = timeSlot.split('-');
        if (newParts.length !== 2) {
            // invalid incoming format; let higher layer validate
            return false;
        }
        const newStart = newParts[0].trim().slice(0, 5);
        const newEnd = newParts[1].trim().slice(0, 5);

        // Convert to Date objects for the given date so comparisons work across midnight consistently
        const scheduleStart = new Date(`${date}T${existingStartStr}:00`);
        const scheduleEnd = new Date(`${date}T${existingEndStr}:00`);
        const proposedStart = new Date(`${date}T${newStart}:00`);
        const proposedEnd = new Date(`${date}T${newEnd}:00`);

        return (
            (proposedStart >= scheduleStart && proposedStart < scheduleEnd) ||
            (proposedEnd > scheduleStart && proposedEnd <= scheduleEnd) ||
            (proposedStart <= scheduleStart && proposedEnd >= scheduleEnd)
        );
    });
};

module.exports = {
    findAllByDoctor,
    findById,
    create,
    update,
    remove,
    getWeeklySchedule,
    getDailySchedule,
    checkConflicts
};