/**
 * Appointments Service
 * Business logic for appointments
 */

const appointmentsRepository = require('./appointments.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all appointments with filters
 */
const getAppointments = async (filters) => {
  return await appointmentsRepository.findAll(filters);
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (appointmentId) => {
  const appointment = await appointmentsRepository.findById(appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};

/**
 * Get patient appointments
 */
const getPatientAppointments = async (patientId) => {
  const appointments = await appointmentsRepository.findByPatientId(patientId);

  // Return flat array for easier frontend consumption
  return appointments;
};

/**
 * Get doctor appointments
 */
const getDoctorAppointments = async (doctorId) => {
  const appointments = await appointmentsRepository.findByDoctorId(doctorId);

  // Return flat array for easier frontend consumption
  return appointments;
};

/**
 * Get upcoming appointments
 */
const getUpcomingAppointments = async (userId, role) => {
  return await appointmentsRepository.findUpcoming(userId, role);
};

/**
 * Get past appointments
 */
const getPastAppointments = async (userId, role) => {
  return await appointmentsRepository.findPast(userId, role);
};

/**
 * Create new appointment
 */
/**
 * Create new appointment
 */
const createAppointment = async (appointmentData) => {
  const { supabase } = require('../../config/database');

  // Validate appointment date is in the future
  let appointmentDate = new Date(appointmentData.date);

  // Handle cases like "2025-11-20"
  if (isNaN(appointmentDate.getTime())) {
    appointmentDate = new Date(`${appointmentData.date}T00:00:00Z`);
  }

  if (isNaN(appointmentDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    throw new Error('Appointment date must be in the future');
  }

  // Check if doctor has this time slot available in their schedule
  const { data: schedules, error: scheduleError } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', appointmentData.doctorId || appointmentData.doctor_id)
    .eq('date', appointmentData.date)
    .eq('time_slot', appointmentData.timeSlot || appointmentData.time_slot)
    .eq('is_available', true);

  if (scheduleError) {
    logger.error('Error checking doctor schedule', { error: scheduleError.message });
    throw new Error('Failed to check doctor availability');
  }

  if (!schedules || schedules.length === 0) {
    throw new Error('Doctor is not available at this time. Please choose another time slot.');
  }

  // Check for existing appointments at this time slot
  const { data: existingAppointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('doctor_id', appointmentData.doctorId || appointmentData.doctor_id)
    .eq('date', appointmentData.date)
    .eq('time_slot', appointmentData.timeSlot || appointmentData.time_slot)
    .in('status', ['pending', 'confirmed', 'scheduled'])
    .is('deleted_at', null);

  if (appointmentError) {
    logger.error('Error checking appointment conflicts', { error: appointmentError.message });
    throw new Error('Failed to check appointment availability');
  }

  if (existingAppointments && existingAppointments.length > 0) {
    throw new Error('This time slot is already booked. Please choose another time.');
  }

  // Create appointment
  const appointment = await appointmentsRepository.create(appointmentData);

  logger.info('Appointment created', {
    appointmentId: appointment.id,
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId
  });

  return appointment;
};

// const createAppointment = async (appointmentData) => {
//   // Validate appointment date is in the future
// const appointmentDate = new Date(appointmentData.date);
//   const now = new Date();

//   if (appointmentDate <= now) {
//     throw new Error('Appointment date must be in the future');
//   }

//   // Check for conflicting appointments
//   const conflicts = await appointmentsRepository.findConflicts(
//     appointmentData.doctorId,
//     appointmentData.appointmentDate
//   );

//   if (conflicts && conflicts.length > 0) {
//     throw new Error('Doctor is not available at this time. Please choose another time slot.');
//   }

//   // Create appointment
//   const appointment = await appointmentsRepository.create(appointmentData);

//   logger.info('Appointment created', { 
//     appointmentId: appointment.id,
//     patientId: appointmentData.patientId,
//     doctorId: appointmentData.doctorId
//   });

//   return appointment;
// };

/**
 * Update appointment
 */
const updateAppointment = async (appointmentId, updates) => {
  // Check if appointment exists
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error('Appointment not found');
  }

  // If updating appointment date, check for conflicts
  if (updates.appointmentDate) {
    const appointmentDate = new Date(updates.appointmentDate);
    const now = new Date();

    if (appointmentDate <= now) {
      throw new Error('Appointment date must be in the future');
    }

    const conflicts = await appointmentsRepository.findConflicts(
      existing.doctor_id,
      updates.appointmentDate,
      appointmentId
    );

    if (conflicts && conflicts.length > 0) {
      throw new Error('Doctor is not available at this time. Please choose another time slot.');
    }
  }

  // Update appointment
  const appointment = await appointmentsRepository.update(appointmentId, updates);

  logger.info('Appointment updated', { appointmentId });

  return appointment;
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (appointmentId, cancelReason) => {
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error('Appointment not found');
  }

  if (existing.status === 'cancelled') {
    throw new Error('Appointment is already cancelled');
  }

  if (existing.status === 'completed') {
    throw new Error('Cannot cancel completed appointment');
  }

  const appointment = await appointmentsRepository.cancel(appointmentId, cancelReason);

  logger.info('Appointment cancelled', { appointmentId, reason: cancelReason });

  return appointment;
};

/**
 * Delete appointment (soft delete)
 */
const deleteAppointment = async (appointmentId) => {
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error('Appointment not found');
  }

  await appointmentsRepository.softDelete(appointmentId);

  logger.info('Appointment deleted', { appointmentId });

  return { success: true };
};

/**
 * Complete appointment
 */
const completeAppointment = async (appointmentId, notes = null) => {
  // Check if appointment exists
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error('Appointment not found');
  }

  const updates = {
    status: 'completed'
  };

  if (notes) {
    updates.notes = notes;
  }

  // Directly update without validation checks since we're just marking complete
  const appointment = await appointmentsRepository.update(appointmentId, updates);

  logger.info('Appointment completed', { appointmentId });

  return appointment;
};

module.exports = {
  getAppointments,
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
