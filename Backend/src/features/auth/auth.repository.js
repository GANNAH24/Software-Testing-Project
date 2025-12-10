/**
 * Auth Repository
 * Data access layer for authentication
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Find profile by ID
 */
const findProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    logger.error('Error finding profile by ID', { userId, error: error.message });
    throw error;
  }

  return data;
};

/**
 * Find profile by email
 */
const findProfileByEmail = async (email) => {
  // First get user from auth.users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    logger.error('Error listing users', { error: error.message });
    throw error;
  }

  const user = users.find(u => u.email === email);
  if (!user) return null;

  // Then get profile
  return await findProfileById(user.id);
};

/**
 * Create patient record
 */
const createPatient = async (userId, patientData = {}) => {
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      patient_id: userId,  // patient_id references profiles(id)
      date_of_birth: patientData.dateOfBirth,
      gender: patientData.gender,
      phone: patientData.phone,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error creating patient', { userId, error: error.message });
    throw error;
  }

  return data;
};

/**
 * Create doctor record
 */
const createDoctor = async (userId, doctorData) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert([{
      user_id: userId,
      name: doctorData.fullName || doctorData.name,
      specialty: doctorData.specialty,
      qualifications: doctorData.qualifications || 'Not specified',
      reviews: doctorData.reviews || 0,
      location: doctorData.location || 'Not specified',
      phone: doctorData.phone || null,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error creating doctor', { userId, error: error.message });
    throw error;
  }

  return data;
};

/**
 * Get role-specific data
 */
const getRoleSpecificData = async (userId, role) => {
  if (role === 'patient') {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error getting patient data', { userId, error: error.message });
    }
    return data;
  }

  if (role === 'doctor') {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error getting doctor data', { userId, error: error.message });
    }
    return data;
  }

  if (role === 'admin') {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error getting admin data', { userId, error: error.message });
    }
    return data;
  }

  return null;
};

/**
 * Update profile
 */
const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating profile', { userId, error: error.message });
    throw error;
  }

  return data;
};

module.exports = {
  findProfileById,
  findProfileByEmail,
  createPatient,
  createDoctor,
  getRoleSpecificData,
  updateProfile
};
