require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./src/supabase');
const appointmentRoutes = require('./routes/appointmentRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/appointments', appointmentRoutes);


// Root route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

// Health check for Supabase
app.get('/health/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('appointments').select('id').limit(1);
    if (error) throw error;
    return res.json({ ok: true, supabaseReachable: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// 🩺 Create a new appointment
app.post('/appointments', async (req, res) => {
  const { patient_id, doctor_id, date, time, notes, status } = req.body;

  if (!patient_id || !doctor_id || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id,
          doctor_id,
          date,
          time,
          notes: notes || '',
          status: status || 'pending', // default value
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Appointment created', appointment: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all appointments (include doctor & patient info)
app.get('/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time,
        notes,
        status,
        created_at,
        doctor:doctor_id ( id, name, specialty ),
        patient:patient_id ( id, name, age )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, appointments: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧑‍⚕️ Get appointments by doctor
app.get('/appointments/doctor/:id', async (req, res) => {
  const doctorId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, appointments: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👩‍🦰 Get appointments by patient
app.get('/appointments/patient/:id', async (req, res) => {
  const patientId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, appointments: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
