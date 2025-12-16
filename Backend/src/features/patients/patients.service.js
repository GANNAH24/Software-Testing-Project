/**
 * Patients Service
 * Business logic for patients
 * Wraps patient data and related appointments
 */

const PatientsRepository = require('./patients.repository');
const { supabase } = require('../../config/database');
const { mapPatientUpdatesToDb } = require('./patients.mapper');



const PatientsService = {
  // List all patients
  async listAll() {
    return await PatientsRepository.getAllPatients();
  },

  // Get a patient by ID
async getById(patientId) {
  const patient = await PatientsRepository.getPatientById(patientId);

  if (!patient) {
    return null; // ✅ DO NOT throw
  }

  return {
    ...patient,
    full_name: patient.profiles?.full_name || null
  };
}

,

  // Get a patient by user ID
async getByUserId(userId) {
  const patient = await PatientsRepository.getPatientByUserId(userId);

  if (!patient) {
    throw new Error('Patient not found');
  }

  // ✅ ADD SAME NORMALIZATION
  return {
    ...patient,
    full_name: patient.profiles?.full_name || null
  };
},

  // Create a new patient
  async create(patientData) {
    return await PatientsRepository.createPatient(patientData);
  },

  // Update a patient
  async update(patientId, updates) {
    const dbUpdates = mapPatientUpdatesToDb(updates);

    if (Object.keys(dbUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    return await PatientsRepository.updatePatient(patientId, dbUpdates);
  },

  // Fetch all appointments for a patient
  async getAppointments(patientId) {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw new Error(error.message);

    const now = new Date();

    // Split upcoming and past
    const upcoming = appointments
      .filter(a => new Date(`${a.date}T${a.time_slot.split('-')[0]}`) >= now && a.status === 'booked')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
        const dateB = new Date(`${b.date}T${b.time_slot.split('-')[0]}`);
        return dateA - dateB; // ascending
      });

    const past = appointments
      .filter(a => new Date(`${a.date}T${a.time_slot.split('-')[0]}`) < now || a.status === 'cancelled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
        const dateB = new Date(`${b.date}T${b.time_slot.split('-')[0]}`);
        return dateB - dateA; // descending
      });

    return { upcoming, past };
  },

  // Cancel an upcoming appointment
  async cancelAppointment(appointmentId) {
    // Fetch the appointment first
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_id', appointmentId);

    if (fetchError) throw new Error(fetchError.message);
    if (!appointments || appointments.length === 0) throw new Error('Appointment not found');

    const appointment = appointments[0];
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time_slot.split('-')[0]}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      throw new Error('Past appointments cannot be cancelled');
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('appointment_id', appointmentId)
      .select();

    if (error) throw new Error(error.message);

    return data[0];
  }
};

module.exports = PatientsService;
