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
        return await doctorsService.getDoctorByUserId(user.id);
    } catch (err) {
        // create a minimal doctor profile automatically
        const doctorData = {
            userId: user.id,
            name: user.fullName || user.email || 'Unnamed Doctor',
            specialty: 'Not specified',
            qualifications: 'Not specified',
            location: 'Not specified'
        };

        return await doctorsService.createDoctor(doctorData);
    }
};

const createSchedule = asyncHandler(async (req, res) => {
    // Resolve or create doctor record for the authenticated user
    const doctor = await ensureDoctorForUser(req.user);

    const scheduleData = {
        doctorId: doctor.doctor_id || doctor.id || doctor.doctorId,
        date: req.body.date,
        timeSlot: req.body.time_slot,
        isAvailable: req.body.is_available
    };

    const schedule = await schedulesService.createSchedule(scheduleData);
    res.status(201).json(successResponse(schedule, 'Schedule created successfully', 201));
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
        req.body.time_slot
    );
    res.status(201).json(successResponse(schedule, 'Time blocked successfully', 201));
});

module.exports = {
    createSchedule,
    getWeeklySchedule,
    getDailySchedule,
    blockTime
};


/**
 * Update schedule (e.g., block or set available)
 * PATCH /api/v1/schedules/:id
 */
const updateSchedule = asyncHandler(async (req, res) => {
    const scheduleId = req.params.id;

    // Ensure doctor exists and is the owner (ensureDoctorForUser will create if missing)
    const doctor = await ensureDoctorForUser(req.user);

    // Build updates mapping from request body
    const updates = {};
    if (req.body.date) updates.date = req.body.date;
    if (req.body.time_slot) updates.timeSlot = req.body.time_slot;
    if (req.body.is_available !== undefined) updates.isAvailable = req.body.is_available;
    if (req.body.notes) updates.notes = req.body.notes;

    // Call service to perform update (service validates and checks conflicts)
    const updated = await schedulesService.updateSchedule(scheduleId, updates);

    res.json(successResponse(updated, 'Schedule updated successfully'));
});

// Export the updateSchedule function
module.exports.updateSchedule = updateSchedule;