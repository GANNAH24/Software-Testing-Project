/**
 * Admin Service
 * Business logic for admin operations
 */

const adminRepository = require('./admin.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all doctors
 */
const getAllDoctors = async (filters = {}) => {
  return await adminRepository.getAllDoctors(filters);
};

/**
 * Get all patients
 */
const getAllPatients = async (filters = {}) => {
  return await adminRepository.getAllPatients(filters);
};

/**
 * Get all appointments
 */
const getAllAppointments = async (filters = {}) => {
  return await adminRepository.getAllAppointments(filters);
};

/**
 * Create doctor
 */
const createDoctor = async (doctorData) => {
  // Validation
  if (!doctorData.name || !doctorData.specialty) {
    throw new Error('Name and specialty are required');
  }

  const doctor = await adminRepository.createDoctor(doctorData);
  logger.info('Doctor created by admin', { doctorId: doctor.doctor_id });
  return doctor;
};

/**
 * Update doctor
 */
const updateDoctor = async (doctorId, updates) => {
  const doctor = await adminRepository.updateDoctor(doctorId, updates);
  logger.info('Doctor updated by admin', { doctorId });
  return doctor;
};

/**
 * Delete doctor
 */
const deleteDoctor = async (doctorId) => {
  const doctor = await adminRepository.deleteDoctor(doctorId);
  logger.info('Doctor deleted by admin', { doctorId });
  return doctor;
};

/**
 * Update patient
 */
const updatePatient = async (patientId, updates) => {
  const patient = await adminRepository.updatePatient(patientId, updates);
  logger.info('Patient updated by admin', { patientId });
  return patient;
};

/**
 * Update appointment
 */
const updateAppointment = async (appointmentId, updates) => {
  const appointment = await adminRepository.updateAppointment(appointmentId, updates);
  logger.info('Appointment updated by admin', { appointmentId });
  return appointment;
};

/**
 * Delete appointment
 */
const deleteAppointment = async (appointmentId) => {
  const appointment = await adminRepository.deleteAppointment(appointmentId);
  logger.info('Appointment deleted by admin', { appointmentId });
  return appointment;
};

/**
 * Get system statistics
 */
const getSystemStats = async () => {
  return await adminRepository.getSystemStats();
};

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
