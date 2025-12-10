/**
 * Appointments Controller
 * Presentation layer for appointments
 */

const appointmentsService = require('./appointments.service');
const patientsService = require('../patients/patients.service');
const doctorsService = require('../doctors/doctors.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

// Ensure a patient record exists for the authenticated user
const ensurePatientForUser = async (user) => {
  try {
    const patient = await patientsService.getByUserId(user.id);
    return patient;
  } catch (err) {
    // If patient not found, create a minimal profile automatically
    console.log('[DEBUG] Patient not found for user:', user.id, 'Creating new patient record');
    try {
      const patientData = {
        patient_id: user.id,
        first_name: user.fullName?.split(' ')[0] || user.email?.split('@')[0] || 'Unknown',
        last_name: user.fullName?.split(' ').slice(1).join(' ') || 'Patient',
        phone: user.phone || 'Not provided',
        date_of_birth: null,
        gender: null,
        created_at: new Date().toISOString()
      };
      const newPatient = await patientsService.create(patientData);
      console.log('[DEBUG] Created new patient:', newPatient);
      return newPatient;
    } catch (createErr) {
      console.error('[ERROR] Failed to create patient:', createErr);
      throw new Error('Failed to create patient record: ' + createErr.message);
    }
  }
};

// Get all appointments (with filters)
const getAllAppointments = asyncHandler(async (req, res) => {
  const filters = {
    patientId: req.query.patient_id,
    doctorId: req.query.doctor_id,
    status: req.query.status,
    startDate: req.query.start_date,
    endDate: req.query.end_date
  };

  const appointments = await appointmentsService.getAppointments(filters);
  res.json(successResponse(appointments));
});

// Get appointment by ID
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.getAppointmentById(req.params.id);
  res.json(successResponse(appointment));
});

// Get patient appointments
const getPatientAppointments = asyncHandler(async (req, res) => {
  // The patientId param is actually the user ID, we need to get the patient record
  const patient = await ensurePatientForUser({ id: req.params.patientId });
  const appointments = await appointmentsService.getPatientAppointments(patient.patient_id);
  res.json(successResponse(appointments));
});

// Get doctor appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctorIdOrUserId = req.params.doctorId;
  let doctor = null;
  
  // Try to get doctor by user_id first (in case auth user ID is passed)
  try {
    doctor = await doctorsService.getByUserId(doctorIdOrUserId);
  } catch (err) {
    // If not found by user_id, try by doctor_id
    try {
      doctor = await doctorsService.getById(doctorIdOrUserId);
    } catch (innerErr) {
      return res.status(404).json(errorResponse('Doctor not found', 404));
    }
  }
  
  if (!doctor) {
    return res.status(404).json(errorResponse('Doctor not found', 404));
  }
  
  const appointments = await appointmentsService.getDoctorAppointments(doctor.doctor_id);
  res.json(successResponse(appointments));
});

// Get upcoming appointments
const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentsService.getUpcomingAppointments(
    req.user.id,
    req.user.role
  );
  res.json(successResponse(appointments));
});

// Get past appointments
const getPastAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentsService.getPastAppointments(
    req.user.id,
    req.user.role
  );
  res.json(successResponse(appointments));
});

// Create appointment
const createAppointment = asyncHandler(async (req, res) => {
  // Ensure patient record exists for the authenticated user
  const patient = await ensurePatientForUser(req.user);
  
  const appointmentData = {
    patientId: patient.patient_id,
    doctorId: req.body.doctor_id,
    date: req.body.date,                // ✅ match repository key
    time_slot: req.body.time_slot,      // ✅ match repository key
    reason: req.body.reason,
    status: req.body.status,
    notes: req.body.notes
  };

  const appointment = await appointmentsService.createAppointment(appointmentData);
  res.status(201).json(successResponse(appointment, 'Appointment created successfully', 201));
});

// Update appointment
const updateAppointment = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.appointment_date) updates.appointmentDate = req.body.appointment_date;
  if (req.body.reason) updates.reason = req.body.reason;
  if (req.body.status) updates.status = req.body.status;
  if (req.body.notes) updates.notes = req.body.notes;

  const appointment = await appointmentsService.updateAppointment(req.params.id, updates);
  res.json(successResponse(appointment, 'Appointment updated successfully'));
});

// Cancel appointment
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.cancelAppointment(
    req.params.id,
    req.body.cancel_reason
  );
  res.json(successResponse(appointment, 'Appointment cancelled successfully'));
});

// Delete appointment
const deleteAppointment = asyncHandler(async (req, res) => {
  await appointmentsService.deleteAppointment(req.params.id);
  res.json(successResponse(null, 'Appointment deleted successfully'));
});

// Complete appointment
const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.completeAppointment(
    req.params.id,
    req.body.notes
  );
  res.json(successResponse(appointment, 'Appointment completed successfully'));
});

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  getUpcomingAppointments,
  getPastAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  completeAppointment
};
