/**
 * Admin Repository
 * Data access layer for admin operations
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all doctors with detailed information
 */
const getAllDoctors = async (filters = {}) => {
  let query = supabase
    .from('doctors')
    .select('*')
    .is('deleted_at', null);

  if (filters.specialty) {
    query = query.ilike('specialty', `%${filters.specialty}%`);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    logger.error('Error getting all doctors', { error: error.message });
    throw error;
  }
  return data;
};

/**
 * Get all patients with detailed information
 */
const getAllPatients = async (filters = {}) => {
  let query = supabase
    .from('patients')
    .select('*');

  if (filters.search) {
    query = query.or(`phone.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    logger.error('Error getting all patients', { error: error.message });
    throw error;
  }

  // Get profiles for patients to get full_name
  if (data && data.length > 0) {
    const userIds = data.map(p => p.user_id).filter(Boolean);
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (!profileError && profiles) {
        // Map profiles to patients
        data.forEach(patient => {
          const profile = profiles.find(p => p.id === patient.user_id);
          if (profile) {
            patient.full_name = profile.full_name;
            patient.email = profile.email;
          }
        });
      }
    }
  }

  return data;
};

/**
 * Get all appointments with doctor and patient info
 */
const getAllAppointments = async (filters = {}) => {
  let query = supabase
    .from('appointments')
    .select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }

  query = query.order('date', { ascending: false });

  const { data, error } = await query;
  if (error) {
    logger.error('Error getting all appointments', { error: error.message });
    throw error;
  }
  return data;
};

/**
 * Create doctor (admin only)
 */
const createDoctor = async (doctorData) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert([{
      user_id: doctorData.userId,
      name: doctorData.name,
      specialty: doctorData.specialty,
      qualifications: doctorData.qualifications || 'Not specified',
      location: doctorData.location || 'Not specified',
      phone: doctorData.phone,
      working_hours_start: doctorData.workingHoursStart || '09:00:00',
      working_hours_end: doctorData.workingHoursEnd || '17:00:00',
      reviews: 0,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error creating doctor', { error: error.message });
    throw error;
  }
  return data;
};

/**
 * Update doctor (admin only)
 */
const updateDoctor = async (doctorId, updates) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('doctor_id', doctorId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    logger.error('Error updating doctor', { doctorId, error: error.message });
    throw error;
  }
  return data;
};

/**
 * Delete doctor (admin only - soft delete)
 */
const deleteDoctor = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ deleted_at: new Date().toISOString() })
    .eq('doctor_id', doctorId)
    .select()
    .single();

  if (error) {
    logger.error('Error deleting doctor', { doctorId, error: error.message });
    throw error;
  }
  return data;
};

/**
 * Update patient (admin only)
 */
const updatePatient = async (patientId, updates) => {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('patient_id', patientId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating patient', { patientId, error: error.message });
    throw error;
  }
  return data;
};

/**
 * Update appointment (admin only)
 */
const updateAppointment = async (appointmentId, updates) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('appointment_id', appointmentId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating appointment', { appointmentId, error: error.message });
    throw error;
  }
  return data;
};

/**
 * Delete appointment (admin only)
 */
const deleteAppointment = async (appointmentId) => {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('appointment_id', appointmentId)
    .select()
    .single();

  if (error) {
    logger.error('Error deleting appointment', { appointmentId, error: error.message });
    throw error;
  }
  return data;
};

/**
 * Get system statistics
 */
const getSystemStats = async () => {
  // Total doctors
  const { count: totalDoctors } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  // Active doctors (those with appointments in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activeDoctorIds } = await supabase
    .from('appointments')
    .select('doctor_id')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
  
  const uniqueActiveDoctors = activeDoctorIds 
    ? new Set(activeDoctorIds.map(a => a.doctor_id)).size 
    : 0;

  // Total patients
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  // Total appointments
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  // Pending appointments
  const { count: pendingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    totalDoctors: totalDoctors || 0,
    activeDoctors: uniqueActiveDoctors,
    totalPatients: totalPatients || 0,
    totalAppointments: totalAppointments || 0,
    pendingAppointments: pendingAppointments || 0
  };
};

module.exports = {
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updatePatient,
  updateAppointment,
  deleteAppointment,
  getSystemStats
};
