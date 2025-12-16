/**
 * Schedules Controller
 * Presentation layer for doctor schedules
 */

const schedulesService = require('./schedules.service');
const doctorsService = require('../doctors/doctors.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

/**
 * Create new schedule (set availability)
 */
// Ensure a doctors row exists for the authenticated user; create a minimal one if missing
const ensureDoctorForUser = async (user) => {
    try {
        const doctor = await doctorsService.getDoctorByUserId(user.id);
        if (doctor) return doctor;
        
        // If no doctor found, throw error to trigger catch block for creation
        throw new Error('Doctor not found');
    } catch (err) {
        // create a minimal doctor profile automatically
        const doctorData = {
            userId: user.id,
            name: user.full_name || user.email || 'Unnamed Doctor', // Use full_name from Supabase user metadata
            specialty: 'General Practitioner', // Default specialty
            qualifications: 'MD', // Default qualification
            location: 'General Hospital' // Default location
        };

        return await doctorsService.createDoctor(doctorData);
    }
};

const createSchedule = asyncHandler(async (req, res) => {
    const doctor = await ensureDoctorForUser(req.user);

    const scheduleData = {
        doctorId: doctor.doctor_id || doctor.id || doctor.doctorId,
        date: req.body.date,
        timeSlot: req.body.timeSlot || req.body.time_slot,
        // Normalize isAvailable with proper default
        isAvailable: req.body.isAvailable !== undefined 
                     ? req.body.isAvailable 
                     : (req.body.is_available !== undefined ? req.body.is_available : true),
        repeatWeekly: req.body.repeatWeekly 
                     || req.body.repeat_weekly 
                     || false
    };

    try {
        const schedule = await schedulesService.createSchedule(scheduleData);
        res.status(201).json(successResponse(schedule, 'Schedule created successfully', 201));
    } catch (err) {
        const statusCode = err.statusCode || 400;
        res.status(statusCode).json(errorResponse(err.message, statusCode));
    }
});


/**
 * Get weekly schedule
 */
const getWeeklySchedule = asyncHandler(async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const doctor = await ensureDoctorForUser(req.user);
    const schedule = await schedulesService.getWeeklySchedule(doctor.doctor_id || doctor.id || doctor.doctorId, date);
    res.json(successResponse(schedule));
});

/**
 * Get daily schedule
 */
const getDailySchedule = asyncHandler(async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const doctor = await ensureDoctorForUser(req.user);
    const schedule = await schedulesService.getDailySchedule(doctor.doctor_id || doctor.id || doctor.doctorId, date);
    res.json(successResponse(schedule));
});

/**
 * Block off time
 */
const blockTime = asyncHandler(async (req, res) => {
    const doctor = await ensureDoctorForUser(req.user);

    const schedule = await schedulesService.blockTime(
        doctor.doctor_id || doctor.id || doctor.doctorId,
        req.body.date,
        req.body.timeSlot || req.body.time_slot
    );
    res.status(201).json(successResponse(schedule, 'Time blocked successfully', 201));
});

/**
 * Get all schedules with optional filters
 * GET /api/v1/schedules
 */
const getAllSchedules = asyncHandler(async (req, res) => {
    let { doctorId, date, isAvailable, startDate, endDate } = req.query;
    
    // If no doctorId provided but user is a doctor, use their doctor ID
    if (!doctorId && req.user && req.user.role === 'doctor') {
        const doctor = await ensureDoctorForUser(req.user);
        doctorId = doctor.doctor_id || doctor.id || doctor.doctorId;
    }
    
    const filters = {};
    if (doctorId) filters.doctorId = doctorId;
    if (date) filters.date = date;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    
    // If doctorId provided or derived, get schedules for that doctor
    if (doctorId) {
        const schedules = await schedulesService.getDoctorSchedules(doctorId, filters);
        res.json(successResponse(schedules));
    } else {
        // Get all schedules (could be limited by filters)
        const schedules = await schedulesService.getDoctorSchedules(null, filters);
        res.json(successResponse(schedules));
    }
});

/**
 * Update schedule (e.g., block or set available)
 * PATCH/PUT /api/v1/schedules/:id
 */
const updateSchedule = asyncHandler(async (req, res) => {
    const scheduleId = req.params.id;

    // Ensure doctor exists and is the owner (ensureDoctorForUser will create if missing)
    const doctor = await ensureDoctorForUser(req.user);

    // Build updates mapping from request body
    const updates = {};
    if (req.body.date) updates.date = req.body.date;
    if (req.body.timeSlot || req.body.time_slot) updates.timeSlot = req.body.timeSlot || req.body.time_slot;
    if (req.body.is_available !== undefined) updates.isAvailable = req.body.is_available;
    if (req.body.notes) updates.notes = req.body.notes;

    // Call service to perform update (service validates and checks conflicts)
    const updated = await schedulesService.updateSchedule(scheduleId, updates);

    res.json(successResponse(updated, 'Schedule updated successfully'));
});

/**
 * Delete schedule
 * DELETE /api/v1/schedules/:id
 */
const deleteSchedule = asyncHandler(async (req, res) => {
    const scheduleId = req.params.id;
    
    // Ensure doctor exists
    const doctor = await ensureDoctorForUser(req.user);
    
    // Delete the schedule
    await schedulesService.deleteSchedule(scheduleId);
    
    res.json(successResponse(null, 'Schedule deleted successfully'));
});

/**
 * Get available time slots for a doctor on a specific date
 * GET /api/v1/schedules/available-slots?doctor_id=X&date=YYYY-MM-DD
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { doctor_id, date } = req.query;
    
    if (!doctor_id || !date) {
        return res.status(400).json(errorResponse('doctor_id and date are required', 400));
    }
    
    // Ensure the requested date is not in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
        return res.json(successResponse({ availableSlots: [] }));
    }
    
    // Get only available schedules for the doctor on the specified date
    const schedules = await schedulesService.getDoctorSchedules(doctor_id, {
        date,
        isAvailable: true
    });
    
    // Extract time slots from schedules and filter out past times if today
    const isToday = requestedDate.toDateString() === today.toDateString();
    const now = new Date();
    
    let availableSlots = schedules
        .filter(s => s.is_available && s.time_slot)
        .map(s => s.time_slot);
    
    // If today, filter out past time slots
    if (isToday) {
        availableSlots = availableSlots.filter(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':');
            const slotDateTime = new Date(requestedDate);
            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDateTime > now;
        });
    }
    
    availableSlots.sort();
    
    res.json(successResponse({ availableSlots }));
});

module.exports = {
    createSchedule,
    getWeeklySchedule,
    getDailySchedule,
    blockTime,
    getAllSchedules,
    getAvailableSlots,
    updateSchedule,
    deleteSchedule
};