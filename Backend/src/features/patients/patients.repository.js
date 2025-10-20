// src/features/patients/patients.repository.js
const { supabase } = require('../../config/database');

const PatientsRepository = {
  async getAllPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .is('deleted_at', null); // only non-deleted patients
    if (error) throw error;
    return data;
  },

  async getPatientById(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    if (error) throw error;
    return data;
  },

  async createPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updatePatient(patientId, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('patient_id', patientId)
      .select();
    if (error) throw error;
    return data[0];
  }
};

module.exports = PatientsRepository;
