require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// --- Supabase setup ---
const supabaseUrl = 'https://ttclfbqepumctddoxyyj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Root route ---
const patientRoutes = require('./src/routes/patientRoutes');
app.use('/api/patient', patientRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

// --- Supabase health check ---
app.get('/health/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname')
      .limit(1);

    if (error) {
      return res.status(200).json({
        ok: true,
        supabaseReachable: true,
        note: 'Supabase client initialized. Create a real table and update this check.',
        error: error.message,
      });
    }

    res.json({ ok: true, supabaseReachable: true, sample: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Start server ---
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
