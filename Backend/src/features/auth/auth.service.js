/**
 * Auth Service
 * Business logic for authentication
 */

const { supabase } = require('../../config/database');
const { validatePassword } = require('../../shared/utils/password.util');
const authRepository = require('./auth.repository');
const logger = require('../../shared/utils/logger.util');

/**
 * Register new user
 */
const register = async (email, password, role, additionalData = {}) => {
  // Validate role (admin cannot be registered via API)
  const allowedRoles = ['patient', 'doctor'];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const error = new Error('Password does not meet requirements');
    error.passwordErrors = passwordValidation.errors;
    throw error;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate required fields
  if (!additionalData.fullName || additionalData.fullName.trim() === '') {
    throw new Error('Full name is required');
  }

  // Check if user already exists
  const existingProfile = await authRepository.findProfileByEmail(email);
  if (existingProfile) {
    throw new Error('User with this email already exists');
  }

  try {
    // Create Supabase Auth user with metadata
    // The database trigger will automatically create the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: role,
          full_name: additionalData.fullName
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify profile was created by trigger
    const profile = await authRepository.findProfileById(userId);
    if (!profile) {
      throw new Error('Profile was not created by trigger. Check database trigger setup.');
    }

    logger.info('User registered successfully', { userId, email, role });

    // Create role-specific record
    if (role === 'patient') {
      // Validate required patient fields
      if (!additionalData.dateOfBirth || !additionalData.gender || !additionalData.phone) {
        throw new Error('Patients must provide date of birth, gender, and phone number');
      }
      await authRepository.createPatient(userId, additionalData);
    } else if (role === 'doctor') {
      // Validate required doctor fields
      if (!additionalData.specialty || !additionalData.location) {
        throw new Error('Doctors must provide specialty and location');
      }
      await authRepository.createDoctor(userId, additionalData);
    }

    // Return session
    return {
      user: authData.user,
      session: authData.session,
      profile: profile
    };
  } catch (error) {
    logger.error('Registration error', { email, error: error.message });
    throw error;
  }
};

/**
 * Login user
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) throw authError;
    if (!authData.user || !authData.session) {
      throw new Error('Login failed');
    }

    // Get user profile with role
    const profile = await authRepository.findProfileById(authData.user.id);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get role-specific data
    const roleData = await authRepository.getRoleSpecificData(authData.user.id, profile.role);

    logger.info('User logged in successfully', { userId: authData.user.id, email });

    return {
      user: authData.user,
      session: authData.session,
      profile: profile,
      roleData: roleData
    };
  } catch (error) {
    logger.error('Login error', { email, error: error.message });
    throw error;
  }
};

/**
 * Logout user
 */
const logout = async (token) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    logger.info('User logged out successfully');
    return { success: true };
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    throw error;
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (userId) => {
  const profile = await authRepository.findProfileById(userId);
  if (!profile) {
    throw new Error('User not found');
  }

  const roleData = await authRepository.getRoleSpecificData(userId, profile.role);

  return {
    profile,
    roleData
  };
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    const error = new Error('Password does not meet requirements');
    error.passwordErrors = passwordValidation.errors;
    throw error;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    logger.info('Password changed successfully', { userId });
    return { success: true };
  } catch (error) {
    logger.error('Change password error', { userId, error: error.message });
    throw error;
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });
    if (error) throw error;

    logger.info('Password reset requested', { email });
    return { success: true };
  } catch (error) {
    logger.error('Forgot password error', { email, error: error.message });
    throw error;
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    const error = new Error('Password does not meet requirements');
    error.passwordErrors = passwordValidation.errors;
    throw error;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    logger.info('Password reset successfully');
    return { success: true };
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};
