// src/features/patients/patients.repository.js
const { supabase } = require('../../config/database');

const PatientsRepository = {
  async getAllPatients() {
    console.log('[DEBUG] getAllPatients called');
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .is('deleted_at', null); // only non-deleted patients

      if (error) {
        console.error('[DEBUG] Supabase error in getAllPatients:', error);
        throw error;
      }

      console.log('[DEBUG] getAllPatients returned data:', data);
      return data;
    } catch (err) {
      console.error('[DEBUG] Exception in getAllPatients:', err.message);
      throw err;
    }
  },

  async getPatientById(patientId) {
    console.log('[DEBUG] getPatientById called with id:', patientId);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        console.error('[DEBUG] Supabase error in getPatientById:', error);
        throw error;
      }

      console.log('[DEBUG] getPatientById returned data:', data);
      return data;
    } catch (err) {
      console.error('[DEBUG] Exception in getPatientById:', err.message);
      throw err;
    }
  },

  async getPatientByUserId(userId) {
    console.log('[DEBUG] getPatientByUserId called with userId:', userId);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle not found gracefully

      if (error) {
        console.error('[DEBUG] Supabase error in getPatientByUserId:', error);
        throw error;
      }

      console.log('[DEBUG] getPatientByUserId returned data:', data);
      return data; // Will be null if not found
    } catch (err) {
      console.error('[DEBUG] Exception in getPatientByUserId:', err.message);
      throw err;
    }
  },

  async createPatient(patientData) {
  console.log('[DEBUG] Attempting to insert patient:', patientData);
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select();

  if (error) {
    console.error('[DEBUG] Supabase insert error:', error);
    throw error;
  }

  console.log('[DEBUG] Inserted patient:', data);
  return data[0];
},

  async updatePatient(patientId, updates) {
    console.log('[DEBUG] updatePatient called with id:', patientId, 'updates:', updates);
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('patient_id', patientId)
        .select();

      if (error) {
        console.error('[DEBUG] Supabase error in updatePatient:', error);
        throw error;
      }

      console.log('[DEBUG] updatePatient returned data:', data[0]);
      return data[0];
    } catch (err) {
      console.error('[DEBUG] Exception in updatePatient:', err.message);
      throw err;
    }
  }
};

module.exports = PatientsRepository;
