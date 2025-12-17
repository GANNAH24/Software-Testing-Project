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
    return null; // do not throw
  }

  return {
    ...patient,
    full_name: patient.profiles?.full_name || patient.first_name || null, // fallback to first_name
  };
},

// Get a patient by user ID
async getByUserId(userId) {
  const patient = await PatientsRepository.getPatientByUserId(userId);

  if (!patient) {
    throw new Error('Patient not found');
  }

  return {
    ...patient,
    full_name: patient.profiles?.full_name || patient.first_name || null, // fallback to first_name
  };
},

// Update a patient
async update(patientId, updates) {
  const dbUpdates = mapPatientUpdatesToDb(updates);

  if (Object.keys(dbUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const updated = await PatientsRepository.updatePatient(patientId, dbUpdates);

  return {
    ...updated,
    full_name: (updated.profiles?.full_name || updated.first_name || null),
  };
}
,


// Create a new patient
async create(patientData) {
  const created = await PatientsRepository.createPatient(patientData);

  // Force full_name fallback
  return {
    ...created,
    full_name: (created.profiles?.full_name || created.first_name || null),
  };
},

  // // Create a new patient
  // async create(patientData) {
  //   return await PatientsRepository.createPatient(patientData);
  // },

  // // Update a patient
  // async update(patientId, updates) {
  //   const dbUpdates = mapPatientUpdatesToDb(updates);

  //   if (Object.keys(dbUpdates).length === 0) {
  //     throw new Error('No valid fields to update');
  //   }

  //   return await PatientsRepository.updatePatient(patientId, dbUpdates);
  // },

  // Fetch all appointments for a patient
  async getAppointments(patientId) {
    try {
      // Simple direct query - no complex joins to avoid hanging
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .is('deleted_at', null)
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Ensure appointments is an array
      const appointmentsList = Array.isArray(appointments) ? appointments : [];

      const now = new Date();

      // Split upcoming and past
      const upcoming = appointmentsList
        .filter(a => {
          if (!a || !a.date || !a.time_slot) return false;
          try {
            const appointmentDate = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
            return appointmentDate >= now && a.status === 'booked';
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
            const dateB = new Date(`${b.date}T${b.time_slot.split('-')[0]}`);
            return dateA - dateB; // ascending
          } catch (e) {
            return 0;
          }
        });

      const past = appointmentsList
        .filter(a => {
          if (!a || !a.date || !a.time_slot) return false;
          try {
            const appointmentDate = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
            return appointmentDate < now || a.status === 'cancelled';
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(`${a.date}T${a.time_slot.split('-')[0]}`);
            const dateB = new Date(`${b.date}T${b.time_slot.split('-')[0]}`);
            return dateB - dateA; // descending
          } catch (e) {
            return 0;
          }
        });

      return { upcoming, past };
    } catch (error) {
      throw error;
    }
  },

  // Cancel an upcoming appointment
  async cancelAppointment(appointmentId) {
    try {
      // Fetch the appointment first
      const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .is('deleted_at', null);

      if (fetchError) throw new Error(fetchError.message);
      if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[0];
      if (!appointment.date || !appointment.time_slot) {
        throw new Error('Invalid appointment data');
      }

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
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Failed to update appointment');
      }

      return data[0];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = PatientsService;
