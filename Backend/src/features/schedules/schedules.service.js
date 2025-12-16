/**
 * Schedules Service
 * Business logic for doctor schedules
 */

const schedulesRepository = require("./schedules.repository");
const doctorsRepository = require("../doctors/doctors.repository");
const logger = require("../../shared/utils/logger.util");

/**
 * Get all schedules for a doctor
 */
const getDoctorSchedules = async (doctorId, filters = {}) => {
  try {
    const schedules = await schedulesRepository.findAllByDoctor(
      doctorId,
      filters
    );

    // Get doctor's working hours to filter schedules
    // Note: ensuring doctorId is valid is important
    if (!doctorId) return schedules;

    const doctor = await doctorsRepository.findById(doctorId);
    if (!doctor || !doctor.working_hours_start || !doctor.working_hours_end) {
      return schedules; // Return all if no working hours set
    }

    // Filter schedules to only show those within working hours
    const workingStart = doctor.working_hours_start.slice(0, 5); // "09:00:00" -> "09:00"
    const workingEnd = doctor.working_hours_end.slice(0, 5);

    return schedules.filter((schedule) => {
      if (!schedule.time_slot) return true; // Keep if no time slot

      const [slotStart] = schedule.time_slot.split("-");
      const slotTime = slotStart.trim();

      return slotTime >= workingStart && slotTime < workingEnd;
    });
  } catch (error) {
    logger.error("Error in getDoctorSchedules service", {
      doctorId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Get schedule by ID
 */
const getScheduleById = async (scheduleId) => {
  const schedule = await schedulesRepository.findById(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }
  return schedule;
};

/**
 * Create new schedule
 */
const createSchedule = async (scheduleData) => {
  // Validate time slot format (HH:mm-HH:mm)
  const timeSlotRegex =
    /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeSlotRegex.test(scheduleData.timeSlot)) {
    throw new Error("Invalid time slot format. Use HH:mm-HH:mm");
  }

  // Check for conflicts
  const hasConflicts = await schedulesRepository.checkConflicts(
    scheduleData.doctorId,
    scheduleData.date,
    scheduleData.timeSlot
  );

  if (hasConflicts) {
    throw new Error("Schedule conflicts with existing time slots");
  }

  // If repeat weekly, create schedules for the next 12 weeks
  if (scheduleData.repeatWeekly) {
    const schedules = [];
    const baseDate = new Date(scheduleData.date);

    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + i * 7);

      const schedule = await schedulesRepository.create({
        ...scheduleData,
        date: currentDate.toISOString().split("T")[0],
      });

      schedules.push(schedule);
    }

    logger.info("Created repeating weekly schedules", {
      doctorId: scheduleData.doctorId,
      count: schedules.length,
    });

    return schedules;
  }

  // Create single schedule
  const schedule = await schedulesRepository.create(scheduleData);

  logger.info("Schedule created", {
    scheduleId: schedule.schedule_id,
    doctorId: scheduleData.doctorId,
  });

  return schedule;
};

/**
 * Update schedule
 */
const updateSchedule = async (scheduleId, updates) => {
  const existing = await schedulesRepository.findById(scheduleId);
  if (!existing) {
    throw new Error("Schedule not found");
  }

  // If toggling availability to false, check 24-hour policy
  if (
    updates.hasOwnProperty("isAvailable") &&
    updates.isAvailable === false &&
    existing.is_available === true
  ) {
    const scheduleDate = new Date(existing.date);
    const timeSlot = existing.time_slot || existing.timeSlot;
    if (timeSlot) {
      const [startTime] = timeSlot.split("-");
      const [hours, minutes] = startTime.split(":");
      const scheduleDateTime = new Date(scheduleDate);
      scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      const hoursDifference = (scheduleDateTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        const error = new Error(
          "Cannot make time slot unavailable less than 24 hours before scheduled time"
        );
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // If updating time slot, check for conflicts
  if (updates.timeSlot) {
    // Validate time slot format
    const timeSlotRegex =
      /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeSlotRegex.test(updates.timeSlot)) {
      throw new Error("Invalid time slot format. Use HH:mm-HH:mm");
    }

    const [startTime, endTime] = updates.timeSlot.split("-");
    if (startTime >= endTime) {
      throw new Error("End time must be after start time");
    }

    const hasConflicts = await schedulesRepository.checkConflicts(
      existing.doctor_id,
      updates.date || existing.date,
      updates.timeSlot,
      scheduleId
    );

    if (hasConflicts) {
      throw new Error("Schedule conflicts with existing time slots");
    }
  }

  const schedule = await schedulesRepository.update(scheduleId, updates);

  logger.info("Schedule updated", { scheduleId });

  return schedule;
};

/**
 * Delete schedule
 */
const deleteSchedule = async (scheduleId) => {
  const existing = await schedulesRepository.findById(scheduleId);
  if (!existing) {
    throw new Error("Schedule not found");
  }

  await schedulesRepository.remove(scheduleId);

  logger.info("Schedule deleted", { scheduleId });

  return { success: true };
};

/**
 * Get weekly schedule
 */
const getWeeklySchedule = async (doctorId, date) => {
  // Calculate week start (Monday) and end (Sunday)
  const currentDate = new Date(date);
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

  const schedule = await schedulesRepository.getWeeklySchedule(
    doctorId,
    weekStart
  );

  // Organize by day of week
  const weeklySchedule = {
    weekStart: weekStart.toISOString().split("T")[0],
    schedule: {},
  };

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayStr = day.toISOString().split("T")[0];
    weeklySchedule.schedule[dayStr] = schedule.filter((s) => s.date === dayStr);
  }

  return weeklySchedule;
};

/**
 * Get daily schedule
 */
const getDailySchedule = async (doctorId, date) => {
  return await schedulesRepository.getDailySchedule(doctorId, date);
};

/**
 * Block off time (mark as unavailable)
 */
const blockTime = async (doctorId, date, timeSlot, reason = null) => {
  // Purpose: allow doctors to block time ranges even if they overlap existing availability.
  // Behavior:
  // 1. Find existing schedules for the given doctor and date.
  // 2. For any existing schedule that overlaps the requested timeSlot and is_available === true,
  //    update it to is_available = false (override availability).
  // 3. If no existing schedule has exactly the same timeSlot, create a new blocked schedule record.

  // Check if the time slot is within 24 hours
  const scheduleDate = new Date(date);
  const [startTime] = timeSlot.split("-");
  const [hours, minutes] = startTime.split(":");
  const scheduleDateTime = new Date(scheduleDate);
  scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const now = new Date();
  const hoursDifference = (scheduleDateTime - now) / (1000 * 60 * 60);

  if (hoursDifference < 24) {
    const error = new Error(
      "Cannot block time slot less than 24 hours before scheduled time"
    );
    error.statusCode = 400;
    throw error;
  }

  // Helper to parse 'HH:MM' from 'HH:MM:SS' or 'HH:MM'
  const fmt = (t) => t.toString().slice(0, 5);

  const parseRange = (slot) => {
    const parts = slot.split("-").map((p) => p.trim());
    return { start: fmt(parts[0]), end: fmt(parts[1]) };
  };

  const overlaps = (aStart, aEnd, bStart, bEnd) => {
    const as = new Date(`${date}T${aStart}:00`);
    const ae = new Date(`${date}T${aEnd}:00`);
    const bs = new Date(`${date}T${bStart}:00`);
    const be = new Date(`${date}T${bEnd}:00`);
    return (
      (bs >= as && bs < ae) || (be > as && be <= ae) || (bs <= as && be >= ae)
    );
  };

  // Fetch existing schedules for the day
  const existing = await schedulesRepository.getDailySchedule(doctorId, date);

  const target = parseRange(timeSlot);

  const updated = [];
  let exactMatchFound = false;

  // First: if there is any existing blocked schedule that overlaps the requested range,
  // reject the operation (don't allow double-blocking or blocking a subrange of an already blocked slot)
  for (const sch of existing) {
    let existingStart = null;
    let existingEnd = null;
    if (sch.time_slot) {
      const parts = sch.time_slot.split("-");
      existingStart = fmt(parts[0]);
      existingEnd = fmt(parts[1]);
    } else if (sch.start_time && sch.end_time) {
      existingStart = fmt(sch.start_time);
      existingEnd = fmt(sch.end_time);
    } else {
      continue;
    }

    // If this schedule is already blocked and overlaps the requested range -> error
    if (
      sch.is_available === false &&
      overlaps(existingStart, existingEnd, target.start, target.end)
    ) {
      const conflictRange = sch.time_slot || `${existingStart}-${existingEnd}`;
      const err = new Error(
        `Requested time ${timeSlot} overlaps an already-blocked slot: ${conflictRange}`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  for (const sch of existing) {
    // normalize existing time slot
    let existingStart = null;
    let existingEnd = null;
    if (sch.time_slot) {
      const parts = sch.time_slot.split("-");
      existingStart = fmt(parts[0]);
      existingEnd = fmt(parts[1]);
    } else if (sch.start_time && sch.end_time) {
      existingStart = fmt(sch.start_time);
      existingEnd = fmt(sch.end_time);
    } else {
      continue;
    }
    // check exact match
    if (existingStart === target.start && existingEnd === target.end) {
      exactMatchFound = true;
      // If it's available, update to unavailable
      if (sch.is_available) {
        const upd = await schedulesRepository.update(sch.schedule_id, {
          is_available: false,
          notes: reason || sch.notes,
        });
        updated.push(upd);
      } else {
        // already blocked; include as-is
        updated.push(sch);
      }
      // continue scanning to also update other overlapping entries
      continue;
    }

    // if overlapping and currently available, perform splitting logic so only the requested
    // subrange becomes blocked and the remaining available time is preserved
    if (
      overlaps(existingStart, existingEnd, target.start, target.end) &&
      sch.is_available
    ) {
      // compute left and right remaining ranges
      const leftExists = existingStart < target.start;
      const rightExists = existingEnd > target.end;

      // Left part: existingStart -> target.start
      // Right part: target.end -> existingEnd
      const leftSlot = leftExists ? `${existingStart}-${target.start}` : null;
      const rightSlot = rightExists ? `${target.end}-${existingEnd}` : null;

      if (leftExists && rightExists) {
        // Replace original schedule with left part, create right part
        const updLeft = await schedulesRepository.update(sch.schedule_id, {
          time_slot: leftSlot,
          is_available: true,
        });

        const createdRight = await schedulesRepository.create({
          doctorId,
          date,
          timeSlot: rightSlot,
          isAvailable: true,
        });

        updated.push(updLeft);
        updated.push(createdRight);
      } else if (leftExists && !rightExists) {
        // Keep left part only (update original)
        const updLeft = await schedulesRepository.update(sch.schedule_id, {
          time_slot: leftSlot,
          is_available: true,
        });
        updated.push(updLeft);
      } else if (!leftExists && rightExists) {
        // Keep right part only (update original)
        const updRight = await schedulesRepository.update(sch.schedule_id, {
          time_slot: rightSlot,
          is_available: true,
        });
        updated.push(updRight);
      } else {
        // target fully covers existing -> mark entire existing as blocked
        const upd = await schedulesRepository.update(sch.schedule_id, {
          is_available: false,
          notes: reason || sch.notes,
        });
        updated.push(upd);
      }
    }
  }

  // If there was no exact match, create a new blocked slot record
  let created = null;
  if (!exactMatchFound) {
    created = await schedulesRepository.create({
      doctorId,
      date,
      timeSlot,
      isAvailable: false,
      notes: reason,
    });
  }

  // Return a summary: updated existing slots and optionally created new blocked slot
  return { updated, created };
};

module.exports = {
  getDoctorSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getWeeklySchedule,
  getDailySchedule,
  blockTime,
};
