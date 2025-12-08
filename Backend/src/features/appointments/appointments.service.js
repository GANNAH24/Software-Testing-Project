/**
 * Appointments Service
 * Business logic for appointments
 */

const appointmentsRepository = require("./appointments.repository");
const logger = require("../../shared/utils/logger.util");

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
    throw new Error("Appointment not found");
  }
  return appointment;
};

/**
 * Get patient appointments
 */
const getPatientAppointments = async (patientId) => {
  const appointments = await appointmentsRepository.findByPatientId(patientId);

  const now = new Date();
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) < now
  );
  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointment_date) >= now &&
      (apt.status === "scheduled" ||
        apt.status === "booked" ||
        apt.status === "confirmed")
  );

  return {
    all: appointments,
    past: pastAppointments,
    upcoming: upcomingAppointments,
    totalCount: appointments.length,
  };
};

/**
 * Get doctor appointments
 */
const getDoctorAppointments = async (doctorId) => {
  const appointments = await appointmentsRepository.findByDoctorId(doctorId);

  const now = new Date();
  // const pastAppointments = appointments.filter(apt => new Date(apt.appointment_date) < now);
  // const upcomingAppointments = appointments.filter(apt => new Date(apt.appointment_date) >= now && apt.status === 'scheduled');

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < now
  );

  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.date) >= now &&
      (apt.status === "scheduled" ||
        apt.status === "booked" ||
        apt.status === "confirmed")
  );

  return {
    all: appointments,
    past: pastAppointments,
    upcoming: upcomingAppointments,
    totalCount: appointments.length,
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
    throw new Error("Invalid date format");
  }

  const now = new Date();
  if (appointmentDate <= now) {
    throw new Error("Appointment date must be in the future");
  }

  // ✅ Use 'date' instead of 'appointmentDate'
  const conflicts = await appointmentsRepository.findConflicts(
    appointmentData.doctorId,
    appointmentData.date
  );

  if (conflicts && conflicts.length > 0) {
    throw new Error(
      "Doctor is not available at this time. Please choose another time slot."
    );
  }

  // Create appointment
  const appointment = await appointmentsRepository.create(appointmentData);

  logger.info("Appointment created", {
    appointmentId: appointment.id,
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId,
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
    throw new Error("Appointment not found");
  }

  // If updating appointment date, check for conflicts
  if (updates.appointmentDate) {
    const appointmentDate = new Date(updates.appointmentDate);
    const now = new Date();

    if (appointmentDate <= now) {
      throw new Error("Appointment date must be in the future");
    }

    const conflicts = await appointmentsRepository.findConflicts(
      existing.doctor_id,
      updates.appointmentDate,
      appointmentId
    );

    if (conflicts && conflicts.length > 0) {
      throw new Error(
        "Doctor is not available at this time. Please choose another time slot."
      );
    }
  }

  // Update appointment
  const appointment = await appointmentsRepository.update(
    appointmentId,
    updates
  );

  logger.info("Appointment updated", { appointmentId });

  return appointment;
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (appointmentId, cancelReason) => {
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error("Appointment not found");
  }

  if (existing.status === "cancelled") {
    throw new Error("Appointment is already cancelled");
  }

  if (existing.status === "completed") {
    throw new Error("Cannot cancel completed appointment");
  }

  const appointment = await appointmentsRepository.cancel(
    appointmentId,
    cancelReason
  );

  logger.info("Appointment cancelled", { appointmentId, reason: cancelReason });

  return appointment;
};

/**
 * Delete appointment (soft delete)
 */
const deleteAppointment = async (appointmentId) => {
  const existing = await appointmentsRepository.findById(appointmentId);
  if (!existing) {
    throw new Error("Appointment not found");
  }

  await appointmentsRepository.softDelete(appointmentId);

  logger.info("Appointment deleted", { appointmentId });

  return { success: true };
};

/**
 * Complete appointment
 */
const completeAppointment = async (appointmentId, notes = null) => {
  const updates = {
    status: "completed",
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
  completeAppointment,
};
