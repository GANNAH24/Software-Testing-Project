/**
 * Appointments Repository
 * Data access layer for appointments
 */

const { supabase } = require("../../config/database");
const logger = require("../../shared/utils/logger.util");

/**
 * Get all appointments (with filters)
 */
const findAll = async (filters = {}) => {
  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      doctor:doctor_id (
        doctor_id,
        user_id,
        first_name,
        last_name,
        specialty,
        phone,
        location
      ),
      patient:patient_id (
        patient_id,
        user_id,
        first_name,
        last_name,
        phone
      )
    `
    )
    .is("deleted_at", null); // Exclude soft-deleted

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters.doctorId) {
    query = query.eq("doctor_id", filters.doctorId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }

  query = query
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true });

  const { data, error } = await query;

  if (error) {
    logger.error("Error finding appointments", {
      filters,
      error: error.message,
    });
    throw error;
  }

  // Format the data to include flattened doctor and patient info
  return data.map(apt => ({
    ...apt,
    doctor_name: apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : null,
    doctor_specialty: apt.doctor?.specialty,
    doctor_phone: apt.doctor?.phone,
    doctor_location: apt.doctor?.location,
    patient_name: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : null,
    patient_phone: apt.patient?.phone
  }));
};

/**
 * Find appointment by ID
 */
const findById = async (appointmentId) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("appointment_id", appointmentId)
    .is("deleted_at", null)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error("Error finding appointment by ID", {
      appointmentId,
      error: error.message,
    });
    throw error;
  }

  return data;
};

/**
 * Get patient appointments
 */
const findByPatientId = async (patientId) => {
  return await findAll({ patientId });
};

/**
 * Get doctor appointments
 */
const findByDoctorId = async (doctorId) => {
  return await findAll({ doctorId });
};

/**
 * Get upcoming appointments
 */
const findUpcoming = async (userId, role) => {
  const now = new Date().toISOString();

  let query = supabase.from("appointments").select("*").is("deleted_at", null)
                     .gte("date", now)
                     .in("status", ['scheduled', 'booked', 'confirmed']); // explicitly list the statuses

  if (role === "patient") {
    query = query.eq("patient_id", userId);
  } else if (role === "doctor") {
    query = query.eq("doctor_id", userId);
  }

  query = query.order("date", { ascending: true }).order("time_slot", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  return data;
};
/**
 * Get past appointments
 */
const findPast = async (userId, role) => {
  const now = new Date().toISOString();
  const filters = {
    endDate: now,
  };

  if (role === "patient") {
    filters.patientId = userId;
  } else if (role === "doctor") {
    filters.doctorId = userId;
  }

  return await findAll(filters);
};

/**
 * Create appointment
 */
const create = async (appointmentData) => {
  const { data, error } = await supabase
    .from("appointments")
    .insert([
      {
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId,
        date: appointmentData.date,              // ✅ fixed key
        time_slot: appointmentData.time_slot,     // ✅ fixed key
        reason: appointmentData.reason,
        status: appointmentData.status || "scheduled",
        notes: appointmentData.notes || null,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    logger.error("Error creating appointment", {
      appointmentData,
      error: error.message,
    });
    throw error;
  }

  return data;
};


/**
 * Update appointment
 */
const update = async (appointmentId, updates) => {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("appointment_id", appointmentId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    logger.error("Error updating appointment", {
      appointmentId,
      updates,
      error: error.message,
    });
    throw error;
  }

  return data;
};

/**
 * Soft delete appointment
 */
const softDelete = async (appointmentId) => {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("appointment_id", appointmentId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    logger.error("Error soft deleting appointment", {
      appointmentId,
      error: error.message,
    });
    throw error;
  }

  return data;
};

/**
 * Cancel appointment
 */
const cancel = async (appointmentId, cancelReason = null) => {
  return await update(appointmentId, {
    status: "cancelled",
    notes: cancelReason ? `Cancelled: ${cancelReason}` : "Cancelled",
  });
};

/**
 * Check for conflicting appointments
 */
const findConflicts = async (doctorId, date, excludeAppointmentId = null) => {
  // Convert to Date if time is included
  const appointmentTime = new Date(date);
  if (isNaN(appointmentTime.getTime())) {
    throw new Error("Invalid date format in findConflicts()");
  }

  const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000).toISOString();
  const oneHourAfter = new Date(appointmentTime.getTime() + 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("appointments")
    .select("appointment_id, date, status")
    .eq("doctor_id", doctorId)
    .eq("status", "scheduled")
    .is("deleted_at", null)
    .gte("date", oneHourBefore)
    .lte("date", oneHourAfter);

  if (excludeAppointmentId) {
    query = query.neq("appointment_id", excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error finding conflicts", {
      doctorId,
      date,
      error: error.message,
    });
    throw error;
  }

  return data;
};

/**
 * Find appointments needing reminders within a window
 */
const findDueReminders = async (startISO, endISO, type) => {
  const reminderColumn = type === '24h' ? 'reminder_24h_sent_at' : 'reminder_2h_sent_at';
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'scheduled')
    .is('deleted_at', null)
    .is(reminderColumn, null)
    .gte('date', startISO)
    .lt('date', endISO);

  if (error) {
    logger.error('Error fetching due reminders', { startISO, endISO, type, error: error.message });
    throw error;
  }
  return data;
};

const markReminderSent = async (appointmentId, type) => {
  const updates = {};
  if (type === '24h') updates.reminder_24h_sent_at = new Date().toISOString();
  else updates.reminder_2h_sent_at = new Date().toISOString();
  return await update(appointmentId, updates);
};

module.exports = {
  findAll,
  findById,
  findByPatientId,
  findByDoctorId,
  findUpcoming,
  findPast,
  create,
  update,
  softDelete,
  cancel,
  findConflicts,
  findDueReminders,
  markReminderSent,
};
