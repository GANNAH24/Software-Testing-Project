const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// 📋 GET all appointments for a specific patient
router.get('/:patientId/appointments', async (req, res) => {
  const { patientId } = req.params;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    console.log('🔹 Fetching appointments for patient:', patientId);

    // Past appointments (including cancelled)
    const { data: pastAppointments, error: pastError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .lte('date', today)
      .order('date', { ascending: false });

    if (pastError) throw pastError;

    // Upcoming appointments (exclude cancelled)
    const { data: upcomingAppointments, error: upcomingError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .gt('date', today)
      .neq('status', 'cancelled')
      .order('date', { ascending: true });

    if (upcomingError) throw upcomingError;

    console.log('🔹 Past appointments count:', pastAppointments.length);
    console.log('🔹 Upcoming appointments count:', upcomingAppointments.length);

    res.json({
      ok: true,
      pastAppointments,
      upcomingAppointments
    });
  } catch (err) {
    console.error('⚠️ Error fetching appointments:', err.message);
    res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
  }
});

// ❌ PATCH – cancel an appointment by ID (only if upcoming)
router.patch('/appointments/:appointmentId/cancel', async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (fetchError) throw fetchError;
    if (!appointment) return res.status(404).json({ ok: false, message: 'Appointment not found' });

    const now = new Date();
    if (new Date(appointment.date) < now) {
      return res.status(400).json({ ok: false, message: 'Cannot cancel past appointments' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ ok: false, message: 'Appointment already cancelled' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('appointment_id', appointmentId)
      .select();

    if (error) throw error;

    res.json({ ok: true, message: 'Appointment cancelled', data });
  } catch (err) {
    console.error('⚠️ Error cancelling appointment:', err.message);
    res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
