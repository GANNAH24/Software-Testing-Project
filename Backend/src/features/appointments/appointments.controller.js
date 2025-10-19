/**
 * Appointments Controller
 * Presentation layer for appointments
 */

const appointmentsService = require('./appointments.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

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
  const appointments = await appointmentsService.getPatientAppointments(req.params.patientId);
  res.json(successResponse(appointments));
});

// Get doctor appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentsService.getDoctorAppointments(req.params.doctorId);
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
  const appointmentData = {
    patientId: req.body.patient_id || req.user.id,
    doctorId: req.body.doctor_id,
    appointmentDate: req.body.appointment_date,
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
