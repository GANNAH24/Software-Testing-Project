/**
 * Admin Service
 * Business logic for admin operations
 */

const adminRepository = require('./admin.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Get all doctors
 */
const getAllDoctors = async (filters = {}) => {
  return await adminRepository.getAllDoctors(filters);
};

/**
 * Get all patients
 */
const getAllPatients = async (filters = {}) => {
  return await adminRepository.getAllPatients(filters);
};

/**
 * Get all appointments
 */
const getAllAppointments = async (filters = {}) => {
  return await adminRepository.getAllAppointments(filters);
};

/**
 * Create doctor
 */
const createDoctor = async (doctorData) => {
  const { supabase } = require('../../config/database');

  // Validation
  if (!doctorData.name || !doctorData.specialty) {
    throw new Error('Name and specialty are required');
  }

  // Extract first name and generate email
  const firstName = doctorData.name.split(' ')[0].toLowerCase();
  const generatedEmail = `${firstName}.doctor@se7ety.com`;
  const generatedPassword = 'Doctor@123';

  try {
    // 1. Create user account in Supabase Auth
    // The database trigger will automatically create the profile
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: generatedEmail,
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: doctorData.name,
        role: 'doctor'
      }
    });

    if (authError) {
      logger.error('Error creating auth user for doctor', { error: authError.message });
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 2. Wait for database trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Verify profile was created by trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Profile was not created by trigger', { userId, error: profileError?.message });
      // Attempt to delete the auth user since profile creation failed
      await supabase.auth.admin.deleteUser(userId);
      throw new Error('Profile was not created by database trigger. Check trigger setup.');
    }

    // 4. Create doctor record
    const doctor = await adminRepository.createDoctor({
      ...doctorData,
      userId: userId
    });

    logger.info('Doctor created by admin with auto-generated credentials', {
      doctorId: doctor.doctor_id,
      email: generatedEmail
    });

    // Return doctor with credential info
    return {
      ...doctor,
      generatedEmail,
      generatedPassword,
      message: 'Doctor created successfully. Please save these credentials.'
    };
  } catch (error) {
    logger.error('Error in createDoctor service', { error: error.message });
    throw error;
  }
};

/**
 * Update doctor
 */
const updateDoctor = async (doctorId, updates) => {
  const doctor = await adminRepository.updateDoctor(doctorId, updates);
  logger.info('Doctor updated by admin', { doctorId });
  return doctor;
};

/**
 * Delete doctor
 */
const deleteDoctor = async (doctorId) => {
  const doctor = await adminRepository.deleteDoctor(doctorId);
  logger.info('Doctor deleted by admin', { doctorId });
  return doctor;
};

/** 
 * Create patient (admin only)
 */
const createPatient = async (patientData) => {
  const { supabase } = require('../../config/database');

  // Validation
  if (!patientData.fullName || !patientData.email || !patientData.phone) {
    throw new Error('Full name, email, and phone are required');
  }

  try {
    // Generate default password
    const generatedPassword = 'Patient@123';

    // 1. Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: patientData.email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: patientData.fullName,
        role: 'patient'
      }
    });

    if (authError) {
      logger.error('Error creating auth user for patient', { error: authError.message });
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 2. Wait for database trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Profile was not created by trigger', { userId, error: profileError?.message });
      await supabase.auth.admin.deleteUser(userId);
      throw new Error('Profile was not created by database trigger');
    }

    // 4. Create patient record
    const patient = await adminRepository.createPatient({
      userId: userId,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender
    });

    logger.info('Patient created by admin', { patientId: patient.patient_id, email: patientData.email });

    return {
      ...patient,
      full_name: patientData.fullName,
      email: patientData.email,
      dateOfBirth: patient.date_of_birth,
      generatedPassword,
      message: 'Patient created successfully. Default password: Patient@123'
    };
  } catch (error) {
    logger.error('Error in createPatient service', { error: error.message });
    throw error;
  }
};

/**
 * Update patient
 */
const updatePatient = async (patientId, updates) => {
  const { supabase } = require('../../config/database');

  try {
    // Update patient table if there are patient fields
    let patient;
    if (updates.patient && Object.keys(updates.patient).length > 0) {
      patient = await adminRepository.updatePatient(patientId, updates.patient);
    } else {
      // Just fetch the current patient
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      patient = data;
    }

    // Update profile table if there are profile fields
    if (updates.profile && Object.keys(updates.profile).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...updates.profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (profileError) {
        logger.error('Error updating patient profile', { patientId, error: profileError.message });
        throw new Error('Failed to update patient profile');
      }
    }

    logger.info('Patient updated by admin', { patientId });
    return patient;
  } catch (error) {
    logger.error('Error in updatePatient service', { error: error.message });
    throw error;
  }
};

/**
 * Delete patient (admin only)
 */
const deletePatient = async (patientId) => {
  const patient = await adminRepository.deletePatient(patientId);
  logger.info('Patient deleted by admin', { patientId });
  return patient;
};

/**
 * Update appointment
 */
const updateAppointment = async (appointmentId, updates) => {
  const appointment = await adminRepository.updateAppointment(appointmentId, updates);
  logger.info('Appointment updated by admin', { appointmentId });
  return appointment;
};

/**
 * Delete appointment
 */
const deleteAppointment = async (appointmentId) => {
  const appointment = await adminRepository.deleteAppointment(appointmentId);
  logger.info('Appointment deleted by admin', { appointmentId });
  return appointment;
};

/**
 * Get system statistics
 */
const getSystemStats = async () => {
  return await adminRepository.getSystemStats();
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
