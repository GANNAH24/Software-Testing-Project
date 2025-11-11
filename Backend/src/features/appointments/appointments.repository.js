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
      *
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

  return data;
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
  const filters = {
    startDate: now,
    status: "scheduled",
  };

  if (role === "patient") {
    filters.patientId = userId;
  } else if (role === "doctor") {
    filters.doctorId = userId;
  }

  return await findAll(filters);
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
const findConflicts = async (doctorId, dateOrDatetime, timeSlot = null, excludeAppointmentId = null) => {
  // If a timeSlot is provided we check same-day slot overlaps (more accurate when appointments store time_slot)
  try {
    if (timeSlot) {
      // Normalize date portion
      const dt = new Date(dateOrDatetime);
      if (isNaN(dt.getTime())) {
        throw new Error('Invalid date/datetime format in findConflicts()');
      }
      const dateOnly = dt.toISOString().split('T')[0];

      let query = supabase
        .from('appointments')
        .select('appointment_id, date, time_slot, status')
        .eq('doctor_id', doctorId)
        .eq('date', dateOnly)
        .eq('status', 'scheduled')
        .is('deleted_at', null);

      if (excludeAppointmentId) query = query.neq('appointment_id', excludeAppointmentId);

      const { data, error } = await query;
      if (error) {
        logger.error('Error finding conflicts (by time_slot)', { doctorId, dateOnly, error: error.message });
        throw error;
      }

      // Helper to test overlap between two 'HH:mm-HH:mm' strings
      const slotOverlaps = (slotA, slotB) => {
        const a = slotA.split('-');
        const b = slotB.split('-');
        if (a.length !== 2 || b.length !== 2) return false;
        const aStart = a[0].trim();
        const aEnd = a[1].trim();
        const bStart = b[0].trim();
        const bEnd = b[1].trim();

        // Compare using minutes since midnight
        const toMinutes = s => {
          const [hh, mm] = s.split(':').map(x => parseInt(x, 10));
          return hh * 60 + mm;
        };

        const aS = toMinutes(aStart);
        const aE = toMinutes(aEnd);
        const bS = toMinutes(bStart);
        const bE = toMinutes(bEnd);

        return (
          (bS >= aS && bS < aE) ||
          (bE > aS && bE <= aE) ||
          (bS <= aS && bE >= aE)
        );
      };

      const conflicts = (data || []).filter(appt => {
        if (!appt.time_slot) return false;
        return slotOverlaps(appt.time_slot, timeSlot);
      });

      return conflicts;
    }

    // Fallback: original ±1 hour window when no time_slot provided
    const appointmentTime = new Date(dateOrDatetime);
    if (isNaN(appointmentTime.getTime())) {
      throw new Error('Invalid date format in findConflicts()');
    }

    const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000).toISOString();
    const oneHourAfter = new Date(appointmentTime.getTime() + 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('appointments')
      .select('appointment_id, date, status')
      .eq('doctor_id', doctorId)
      .eq('status', 'scheduled')
      .is('deleted_at', null)
      .gte('date', oneHourBefore)
      .lte('date', oneHourAfter);

    if (excludeAppointmentId) {
      query = query.neq('appointment_id', excludeAppointmentId);
    }

    const { data, error } = await query;
    if (error) {
      logger.error('Error finding conflicts', { doctorId, dateOrDatetime, error: error.message });
      throw error;
    }

    return data;
  } catch (err) {
    logger.error('findConflicts failed', { doctorId, dateOrDatetime, timeSlot, error: err.message });
    throw err;
  }
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
};
