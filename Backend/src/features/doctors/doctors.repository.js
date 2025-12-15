/**
 * Doctors Repository
 * Data access layer for doctors
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

const findAll = async (filters = {}) => {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      reviews:active_doctor_reviews(count)
    `)
    .is('deleted_at', null);

  // Filter by specialty
  if (filters.specialty) {
    query = query.ilike('specialty', `%${filters.specialty}%`);
  }

  // Filter by location
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  // Search by name (more flexible search)
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Sort by name by default, or by reviews if specified
  if (filters.sortBy === 'reviews') {
    query = query.order('reviews', { ascending: false });
  } else {
    query = query.order('name', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    logger.error('Error finding doctors', { error: error.message });
    throw error;
  }

  // Fetch available slot counts
  const doctorIds = data.map(d => d.doctor_id);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const { data: scheduleData } = await supabase
      .from('doctor_schedules')
      .select('doctor_id, date, time_slot')
      .in('doctor_id', doctorIds)
      .eq('is_available', true)
      .gte('date', todayStr);

  const slotCounts = {};
  if (scheduleData) {
      scheduleData.forEach(s => {
          // If schedule is for today, check if time has passed
          if (s.date === todayStr && s.time_slot) {
              const [startTime] = s.time_slot.split('-');
              const [hours, minutes] = startTime.split(':');
              const slotTime = new Date(now);
              slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              
              if (slotTime <= now) {
                  return; // Skip past slots
              }
          }
          slotCounts[s.doctor_id] = (slotCounts[s.doctor_id] || 0) + 1;
      });
  }

  // Transform the data to include reviews_count and availableSlots
  const transformedData = data.map(doctor => ({
    ...doctor,
    reviews_count: doctor.reviews?.[0]?.count || 0,
    reviewsCount: doctor.reviews?.[0]?.count || 0,
    availableSlots: slotCounts[doctor.doctor_id] || 0
  }));

  return transformedData;
};

const findById = async (doctorId) => {
  // First try to find by doctor_id
  let { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      reviews:active_doctor_reviews(count)
    `)
    .eq('doctor_id', doctorId)
    .is('deleted_at', null)
    .maybeSingle();

  // If not found and looks like a UUID, try user_id
  if (!data && !error && doctorId && doctorId.includes('-')) {
    const result = await supabase
      .from('doctors')
      .select(`
        *,
        reviews:active_doctor_reviews(count)
      `)
      .eq('user_id', doctorId)
      .is('deleted_at', null)
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  if (error && error.code !== 'PGRST116') {
    logger.error('Error finding doctor', { doctorId, error: error.message, details: error });
    throw error;
  }

  // If we found a doctor, fetch the profile data separately
  if (data && data.user_id) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.user_id)
      .single();

    if (!profileError && profileData) {
      data.full_name = profileData.full_name;
    }

    // Get email from auth.users (accessible through Supabase admin API)
    // For now, we'll get it from the authenticated user or leave it null

    // Add review count
    data.reviews_count = data.reviews?.[0]?.count || 0;
    data.reviewsCount = data.reviews?.[0]?.count || 0;
  }

  return data;
};

const findByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle(); // Changed from single() to maybeSingle() to avoid error on not found

  if (error) {
    logger.error('Error finding doctor by user ID', { userId, error: error.message });
    throw error;
  }
  return data;
};

const findBySpecialty = async (specialty) => {
  return await findAll({ specialty });
};

const findByLocation = async (location) => {
  return await findAll({ location });
};

const advancedSearch = async (filters) => {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      reviews:active_doctor_reviews(count)
    `)
    .is('deleted_at', null);

  // Search by name, specialty, or qualifications
  if (filters.searchTerm) {
    query = query.or(
      `name.ilike.%${filters.searchTerm}%,` +
      `specialty.ilike.%${filters.searchTerm}%,` +
      `qualifications.ilike.%${filters.searchTerm}%`
    );
  }

  // Filter by specialty (exact or partial match)
  if (filters.specialty) {
    query = query.ilike('specialty', `%${filters.specialty}%`);
  }

  // Filter by location
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  // Filter by minimum reviews
  if (filters.minReviews !== undefined && filters.minReviews !== null) {
    query = query.gte('reviews', filters.minReviews);
  }

  // Sorting
  if (filters.sortBy === 'reviews') {
    query = query.order('reviews', { ascending: false });
  } else if (filters.sortBy === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    // Default: sort by reviews desc, then name asc
    query = query.order('reviews', { ascending: false }).order('name', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    logger.error('Error in advanced doctor search', { error: error.message });
    throw error;
  }

  // Fetch available slot counts
  const doctorIds = data.map(d => d.doctor_id);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const { data: scheduleData } = await supabase
      .from('doctor_schedules')
      .select('doctor_id, date, time_slot')
      .in('doctor_id', doctorIds)
      .eq('is_available', true)
      .gte('date', todayStr);

  const slotCounts = {};
  if (scheduleData) {
      scheduleData.forEach(s => {
          // If schedule is for today, check if time has passed
          if (s.date === todayStr && s.time_slot) {
              const [startTime] = s.time_slot.split('-');
              const [hours, minutes] = startTime.split(':');
              const slotTime = new Date(now);
              slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              
              if (slotTime <= now) {
                  return; // Skip past slots
              }
          }
          slotCounts[s.doctor_id] = (slotCounts[s.doctor_id] || 0) + 1;
      });
  }

  // Transform the data to include reviews_count and availableSlots
  const transformedData = data.map(doctor => ({
    ...doctor,
    reviews_count: doctor.reviews?.[0]?.count || 0,
    reviewsCount: doctor.reviews?.[0]?.count || 0,
    availableSlots: slotCounts[doctor.doctor_id] || 0
  }));

  return transformedData;
};

const getDetailedProfile = async (doctorId) => {
  // Get doctor basic information - use findById for consistency
  const doctor = await findById(doctorId);

  if (!doctor) {
    return null;
  }

  // Get user email from auth (if user_id exists)
  let userEmail = null;
  if (doctor.user_id) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(doctor.user_id);
      if (!authError && user) {
        userEmail = user.email;
      }
    } catch (authErr) {
      logger.warn('Could not fetch user email', { userId: doctor.user_id, error: authErr.message });
    }
  }

  // Get review statistics
  const { data: reviews, error: reviewError } = await supabase
    .from('doctor_reviews')
    .select('rating')
    .eq('doctor_id', doctorId);

  let average_rating = 0;
  let total_reviews = 0;

  if (!reviewError && reviews && reviews.length > 0) {
    total_reviews = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    average_rating = (sum / total_reviews).toFixed(1);
  }

  // Return doctor data with email and review stats
  return {
    ...doctor,
    email: userEmail,
    average_rating: parseFloat(average_rating),
    total_reviews
  };
};

const create = async (doctorData) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert([{
      user_id: doctorData.userId,
      name: doctorData.name,
      specialty: doctorData.specialty,
      qualifications: doctorData.qualifications,
      reviews: doctorData.reviews || 0,
      location: doctorData.location,
      working_hours_start: doctorData.workingHoursStart || '09:00:00',
      working_hours_end: doctorData.workingHoursEnd || '17:00:00',
      phone: doctorData.phone || null,
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
  // Find the doctor first to get the correct record
  const existing = await findById(doctorId);
  if (!existing) {
    throw new Error('Doctor not found');
  }

  const { data, error } = await supabase
    .from('doctors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('doctor_id', existing.doctor_id)
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
  // Find the doctor first to get the correct record
  const existing = await findById(doctorId);
  if (!existing) {
    throw new Error('Doctor not found');
  }

  const { data, error } = await supabase
    .from('doctors')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('doctor_id', existing.doctor_id)
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
  findByLocation,
  advancedSearch,
  getDetailedProfile,
  create,
  update,
  softDelete
};
