const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// 📋 GET all appointments for a specific patient
router.get('/:patientId/appointments', async (req, res) => {
  const { patientId } = req.params;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({ ok: true, appointments: data });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ❌ PATCH – cancel an appointment by ID
router.patch('/appointments/:appointmentId/cancel', async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('appointment_id', appointmentId)
      .select();

    if (error) throw error;

    res.json({ ok: true, message: 'Appointment cancelled', data });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
