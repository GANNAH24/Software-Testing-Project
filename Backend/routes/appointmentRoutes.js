const express = require("express");
const supabase = require("../src/supabase");

const router = express.Router();

/**
 * POST /appointments/book
 * Request body: { patient_id, doctor_id, date, time_slot, notes }
 */
router.post("/book", async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time_slot, notes } = req.body;

    // Step 1: Validate required fields
    if (!patient_id || !doctor_id || !date || !time_slot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 2: Check if the doctor is available for that date & time
    const { data: existingAppointment, error: conflictError } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctor_id)
      .eq("date", date)
      .eq("time_slot", time_slot)
      .maybeSingle();

    if (conflictError) throw conflictError;

    if (existingAppointment) {
      return res
        .status(409)
        .json({ error: "Time slot already booked for this doctor" });
    }

    // Step 3: Check the doctor_schedules table
    const { data: schedule, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("is_available")
      .eq("doctor_id", doctor_id)
      .eq("date", date)
      .eq("time_slot", time_slot)
      .single();

    if (scheduleError && scheduleError.code !== "PGRST116") {
      throw scheduleError;
    }

    if (schedule && !schedule.is_available) {
      return res
        .status(400)
        .json({ error: "Doctor not available at this time" });
    }

    // Step 4: Create new appointment
    const { data: newAppointment, error: insertError } = await supabase
      .from("appointments")
      .insert([
        {
          patient_id,
          doctor_id,
          date,
          time_slot,
          status: "Booked",
          notes,
        },
      ])
      .select();

    if (insertError) throw insertError;

    // Step 5: Mark that time slot as unavailable
    await supabase
      .from("doctor_schedules")
      .update({ is_available: false })
      .eq("doctor_id", doctor_id)
      .eq("date", date)
      .eq("time_slot", time_slot);

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: newAppointment[0],
    });
  } catch (err) {
    console.error("Booking error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;
