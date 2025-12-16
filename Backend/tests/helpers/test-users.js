/**
 * Test User Helper
 * Creates test users using Supabase Admin API to bypass email confirmation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Create test user using admin API (bypasses email confirmation)
 */
async function createTestUser(email, password) {
  try {
    // Check if user already exists and delete if so
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      await deleteTestUser(existingUser.id);
      // Small delay to ensure deletion completes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Use admin API to create user without email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        test_user: true
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    // Also create a profile for the user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: 'Test User',
        role: 'patient', // Default role
        email: email
      });

    if (profileError) {
      console.warn('Profile creation error:', profileError.message);
    }

    return {
      userId: data.user.id,
      profileId: data.user.id,
      user: data.user
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Delete test user using admin API
 */
async function deleteTestUser(userId) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting test user:', error);
    // Don't throw - cleanup is best effort
  }
}

/**
 * Create test doctor user with profile and doctor record
 */
async function createTestDoctor(email, password = 'Test123!@#', specialty = 'General Practice', qualifications = 'MD', location = 'Test City') {
  const userData = await createTestUser(email, password);
  
  // Update profile to doctor role
  await supabaseAdmin
    .from('profiles')
    .update({ role: 'doctor' })
    .eq('id', userData.userId);

  // Create doctor record - name field is required
  const { data: doctor, error: doctorError } = await supabaseAdmin
    .from('doctors')
    .insert({
      user_id: userData.userId,
      name: 'Test Doctor', // Required field
      specialty: specialty,
      qualifications: qualifications,
      location: location,
      reviews: 0 // Default value for reviews count
    })
    .select()
    .single();

  if (doctorError) throw doctorError;

  return {
    user: userData.user,
    doctor,
    userId: userData.userId,
    doctorId: doctor.doctor_id,
    profileId: userData.profileId
  };
}

/**
 * Create test patient user with profile and patient record
 */
async function createTestPatient(email, password = 'Test123!@#', dateOfBirth = '1990-01-01', gender = 'male', phone = '+1234567890') {
  const userData = await createTestUser(email, password);
  
  // Profile already created in createTestUser with patient role

  // Create patient record - phone field is required
  const { error: patientError } = await supabaseAdmin
    .from('patients')
    .insert({
      patient_id: userData.userId,
      user_id: userData.userId, // Set user_id to match patient_id for FK relationships
      date_of_birth: dateOfBirth,
      gender: gender,
      phone: phone // Required field
    });

  if (patientError) throw patientError;

  return {
    user: userData.user,
    userId: userData.userId,
    patientId: userData.userId,
    profileId: userData.profileId
  };
}

/**
 * Cleanup test data for a doctor
 */
async function cleanupTestDoctor(userId) {
  // Get doctor_id first
  const { data: doctor } = await supabaseAdmin
    .from('doctors')
    .select('doctor_id')
    .eq('user_id', userId)
    .single();
  
  if (doctor) {
    await supabaseAdmin.from('appointments').delete().eq('doctor_id', doctor.doctor_id);
    await supabaseAdmin.from('doctor_schedules').delete().eq('doctor_id', doctor.doctor_id);
    await supabaseAdmin.from('reviews').delete().eq('doctor_id', doctor.doctor_id);
    await supabaseAdmin.from('doctors').delete().eq('doctor_id', doctor.doctor_id);
  }
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await deleteTestUser(userId);
}

/**
 * Cleanup test data for a patient
 */
async function cleanupTestPatient(userId) {
  await supabaseAdmin.from('appointments').delete().eq('patient_id', userId);
  await supabaseAdmin.from('reviews').delete().eq('patient_id', userId);
  await supabaseAdmin.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  await supabaseAdmin.from('patients').delete().eq('patient_id', userId);
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await deleteTestUser(userId);
}

module.exports = {
  supabaseAdmin,
  createTestUser,
  deleteTestUser,
  createTestDoctor,
  createTestPatient,
  cleanupTestDoctor,
  cleanupTestPatient
};
