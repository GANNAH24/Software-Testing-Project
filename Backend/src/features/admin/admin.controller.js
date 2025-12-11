/**
 * Admin Controller
 * Presentation layer for admin operations
 */

const adminService = require('./admin.service');
const { successResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

/**
 * Get all doctors
 */
const getAllDoctors = asyncHandler(async (req, res) => {
  const filters = {
    specialty: req.query.specialty,
    search: req.query.search
  };
  const doctors = await adminService.getAllDoctors(filters);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors`));
});

/**
 * Get all patients
 */
const getAllPatients = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search
  };
  const patients = await adminService.getAllPatients(filters);
  res.json(successResponse(patients, `Found ${patients.length} patients`));
});

/**
 * Get all appointments
 */
const getAllAppointments = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };
  const appointments = await adminService.getAllAppointments(filters);
  res.json(successResponse(appointments, `Found ${appointments.length} appointments`));
});

/**
 * Create doctor
 */
const createDoctor = asyncHandler(async (req, res) => {
  const doctorData = {
    userId: req.body.user_id,
    name: req.body.name,
    specialty: req.body.specialty,
    qualifications: req.body.qualifications,
    location: req.body.location,
    phone: req.body.phone,
    workingHoursStart: req.body.working_hours_start,
    workingHoursEnd: req.body.working_hours_end
  };
  const doctor = await adminService.createDoctor(doctorData);
  res.status(201).json(successResponse(doctor, 'Doctor created successfully', 201));
});

/**
 * Update doctor
 */
const updateDoctor = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.specialty) updates.specialty = req.body.specialty;
  if (req.body.qualifications) updates.qualifications = req.body.qualifications;
  if (req.body.location) updates.location = req.body.location;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.working_hours_start) updates.working_hours_start = req.body.working_hours_start;
  if (req.body.working_hours_end) updates.working_hours_end = req.body.working_hours_end;

  const doctor = await adminService.updateDoctor(req.params.id, updates);
  res.json(successResponse(doctor, 'Doctor updated successfully'));
});

/**
 * Delete doctor
 */
const deleteDoctor = asyncHandler(async (req, res) => {
  await adminService.deleteDoctor(req.params.id);
  res.json(successResponse(null, 'Doctor deleted successfully'));
});

/**
 * Update patient
 */
const updatePatient = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.date_of_birth) updates.date_of_birth = req.body.date_of_birth;
  if (req.body.gender) updates.gender = req.body.gender;

  const patient = await adminService.updatePatient(req.params.id, updates);
  res.json(successResponse(patient, 'Patient updated successfully'));
});

/**
 * Update appointment
 */
const updateAppointment = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.date) updates.date = req.body.date;
  if (req.body.time_slot) updates.time_slot = req.body.time_slot;
  if (req.body.notes) updates.notes = req.body.notes;

  const appointment = await adminService.updateAppointment(req.params.id, updates);
  res.json(successResponse(appointment, 'Appointment updated successfully'));
});

/**
 * Delete appointment
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  await adminService.deleteAppointment(req.params.id);
  res.json(successResponse(null, 'Appointment deleted successfully'));
});

/**
 * Get system statistics
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemStats();
  res.json(successResponse(stats));
});

module.exports = {
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updatePatient,
  updateAppointment,
  deleteAppointment,
  getSystemStats
};
