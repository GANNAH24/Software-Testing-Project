/**
 * Doctors Repository
 * Data access layer for doctors
 */

const { supabase } = require('../../../config/database');
const logger = require('../../../shared/utils/logger.util');

const findAll = async (filters = {}) => {
  let query = supabase
    .from('doctors')
    .select('*')
    .is('deleted_at', null);

  if (filters.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters.search) {
    query = query.ilike('full_name', `%${filters.search}%`);
  }

  query = query.order('full_name', { ascending: true });

  const { data, error } = await query;
  if (error) {
    logger.error('Error finding doctors', { error: error.message });
    throw error;
  }
  return data;
};

const findById = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .is('deleted_at', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error finding doctor', { doctorId, error: error.message });
    throw error;
  }
  return data;
};

const findByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error finding doctor by user ID', { userId, error: error.message });
    throw error;
  }
  return data;
};

const findBySpecialty = async (specialty) => {
  return await findAll({ specialty });
};

const create = async (doctorData) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert([{
      user_id: doctorData.userId,
      full_name: doctorData.fullName,
      specialty: doctorData.specialty,
      phone_number: doctorData.phoneNumber,
      qualifications: doctorData.qualifications,
      experience_years: doctorData.experienceYears,
      bio: doctorData.bio,
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

const update = async (doctorId, updates) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', doctorId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    logger.error('Error updating doctor', { doctorId, error: error.message });
    throw error;
  }
  return data;
};

const softDelete = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', doctorId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    logger.error('Error deleting doctor', { doctorId, error: error.message });
    throw error;
  }
  return data;
};

module.exports = {
  findAll,
  findById,
  findByUserId,
  findBySpecialty,
  create,
  update,
  softDelete
};
