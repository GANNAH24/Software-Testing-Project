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
    .select(`
      *,
      reviews:active_doctor_reviews(count)
    `)
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

  // Transform the data to include reviews_count
  const transformedData = data.map(doctor => ({
    ...doctor,
    reviews_count: doctor.reviews?.[0]?.count || 0,
    reviewsCount: doctor.reviews?.[0]?.count || 0
  }));

  return transformedData;
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

  const { data: patients, error } = await query;
  if (error) {
    logger.error('Error getting all patients', { error: error.message });
    throw error;
  }

  // Get all profiles first
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, role');

  if (!allProfiles || allProfiles.length === 0) {
    return [];
  }

  // Get emails from Supabase Auth - need to paginate to get ALL users
  let allAuthUsers = [];
  let page = 1;
  const perPage = 1000; // Max per page
  let hasMore = true;

  while (hasMore) {
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });

    if (authError) {
      logger.error('Error listing users from auth', { error: authError.message });
      break;
    }

    if (users && users.length > 0) {
      allAuthUsers = allAuthUsers.concat(users);
      page++;
      hasMore = users.length === perPage; // Continue if we got a full page
    } else {
      hasMore = false;
    }
  }

  // Create a map of profile_id -> email
  const profileEmailMap = {};
  allAuthUsers.forEach(user => {
    profileEmailMap[user.id] = user.email;
  });

  // Filter patients to only those with matching profiles
  const validPatients = patients.filter(patient => {
    return allProfiles.some(profile => profile.id === patient.patient_id);
  });

  // Attach profile data and emails to valid patients
  validPatients.forEach(patient => {
    const profile = allProfiles.find(p => p.id === patient.patient_id);
    if (profile) {
      patient.full_name = profile.full_name || 'Unknown';
      patient.email = profileEmailMap[patient.patient_id] || 'No Email';
      patient.role = profile.role;
      // Add camelCase version for frontend
      patient.dateOfBirth = patient.date_of_birth;
    }
  });

  return validPatients;
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
 * Create patient (admin only)
 */
const createPatient = async (patientData) => {
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      patient_id: patientData.userId,
      phone: patientData.phone,
      date_of_birth: patientData.dateOfBirth,
      gender: patientData.gender,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error creating patient', { error: error.message });
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
 * Delete patient (admin only - soft delete)
 */
const deletePatient = async (patientId) => {
  const { data, error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('patient_id', patientId)
    .select()
    .single();

  if (error) {
    logger.error('Error deleting patient', { patientId, error: error.message });
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
  createPatient,
  updatePatient,
  deletePatient,
  updateAppointment,
  deleteAppointment,
  getSystemStats
};
