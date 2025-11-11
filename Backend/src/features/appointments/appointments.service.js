/**
 * Appointments Service
 * Business logic for appointments
 */

const appointmentsRepository = require('./appointments.repository');
const schedulesRepository = require('../schedules/schedules.repository');
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

  const now = new Date();
  const pastAppointments = appointments.filter(apt => new Date(apt.appointment_date) < now);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.appointment_date) >= now && apt.status === 'scheduled');

  return {
    all: appointments,
    past: pastAppointments,
    upcoming: upcomingAppointments,
    totalCount: appointments.length
  };
};

/**
 * Get doctor appointments
 */
const getDoctorAppointments = async (doctorId) => {
  const appointments = await appointmentsRepository.findByDoctorId(doctorId);

  const now = new Date();
  const pastAppointments = appointments.filter(apt => new Date(apt.appointment_date) < now);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.appointment_date) >= now && apt.status === 'scheduled');

  return {
    all: appointments,
    past: pastAppointments,
    upcoming: upcomingAppointments,
    totalCount: appointments.length
  };
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
  // Validate appointment date is in the future
  let appointmentDate = new Date(appointmentData.date);

  // Handle cases like "2025-11-20"
  if (isNaN(appointmentDate.getTime())) {
    appointmentDate = new Date(`${appointmentData.date}T00:00:00Z`);
  }

  if (isNaN(appointmentDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const now = new Date();
  if (appointmentDate <= now) {
    throw new Error('Appointment date must be in the future');
  }

  // Require a time_slot so we can check schedule coverage and conflicts precisely
  if (!appointmentData.time_slot) {
    throw new Error('time_slot is required to check doctor availability');
  }

  // Parse appointment start time from provided time_slot (expect 'HH:mm-HH:mm')
  const tsParts = appointmentData.time_slot.split('-');
  if (tsParts.length !== 2) {
    throw new Error('Invalid time_slot format. Expected "HH:mm-HH:mm"');
  }
  const startTimeStr = tsParts[0].trim().slice(0, 5);

  // Build an ISO datetime for the appointment start to run the conflict check (so ±1 hour window is accurate)
  const appointmentDateTimeIso = `${appointmentData.date}T${startTimeStr}:00`;

  // Check for conflicting appointments around the appointment start time (±1 hour)
  const conflicts = await appointmentsRepository.findConflicts(
    appointmentData.doctorId,
    appointmentDateTimeIso,
    appointmentData.time_slot
  );

  if (conflicts && conflicts.length > 0) {
    throw new Error('Doctor is not available at this time. Please choose another time slot.');
  }

  const availableSchedules = await schedulesRepository.findAllByDoctor(
    appointmentData.doctorId,
    { startDate: appointmentData.date, endDate: appointmentData.date, isAvailable: true }
  );

  // Helper to check overlap between two slots in 'HH:mm-HH:mm' format
  const slotOverlaps = (slotA, slotB, date) => {
    const aParts = slotA.split('-');
    const bParts = slotB.split('-');
    if (aParts.length !== 2 || bParts.length !== 2) return false;
    const aStart = new Date(`${date}T${aParts[0].trim()}:00`);
    const aEnd = new Date(`${date}T${aParts[1].trim()}:00`);
    const bStart = new Date(`${date}T${bParts[0].trim()}:00`);
    const bEnd = new Date(`${date}T${bParts[1].trim()}:00`);
    return (
      (bStart >= aStart && bStart < aEnd) ||
      (bEnd > aStart && bEnd <= aEnd) ||
      (bStart <= aStart && bEnd >= aEnd)
    );
  };

  const isCovered = availableSchedules.some(sch => {
    if (sch.time_slot) {
      return slotOverlaps(sch.time_slot, appointmentData.time_slot, appointmentData.date);
    }
    // Support start_time/end_time schema
    if (sch.start_time && sch.end_time) {
      const existingSlot = `${sch.start_time.toString().slice(0, 5)}-${sch.end_time.toString().slice(0, 5)}`;
      return slotOverlaps(existingSlot, appointmentData.time_slot, appointmentData.date);
    }
    return false;
  });

  if (!isCovered) {
    throw new Error('Requested time is not available in doctor schedule. Please choose another time.');
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

    // If updating time_slot too, pass it so repository checks slot overlap; otherwise pass null and exclude this appointment id
    const timeSlotToCheck = updates.time_slot || updates.timeSlot || null;
    const conflicts = await appointmentsRepository.findConflicts(
      existing.doctor_id,
      updates.appointmentDate,
      timeSlotToCheck,
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
  const updates = {
    status: 'completed'
  };

  if (notes) {
    updates.notes = notes;
  }

  return await updateAppointment(appointmentId, updates);
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
