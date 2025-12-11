/**
 * Unit Tests for Auth Service
 * 
 * User Stories Covered:
 * - US-001: As a Patient, I want to register with my personal details so that I can access the healthcare platform
 * - US-002: As a Doctor, I want to register with my professional details so that I can offer my services
 * - US-003: As a User, I want to log in with my email and password so that I can access my account securely
 * - US-004: As a User, I want to receive clear error messages when my password doesn't meet requirements
 * - US-005: As a User, I want to reset my forgotten password so that I can regain access to my account
 */

const authService = require('../../src/features/auth/auth.service');
const authRepository = require('../../src/features/auth/auth.repository');
const { supabase } = require('../../src/config/database');
const { validatePassword } = require('../../src/shared/utils/password.util');

// Mock dependencies
jest.mock('../../src/features/auth/auth.repository');
jest.mock('../../src/config/database', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    }
  }
}));
jest.mock('../../src/shared/utils/password.util');
jest.mock('../../src/shared/utils/logger.util', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('AuthService - User Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * User Story: US-001 - Patient Registration
   */
  describe('Patient Registration - Happy Path', () => {
    it('should successfully register a patient with valid data', async () => {
      // Arrange
      const mockPatientData = {
        email: 'patient@test.com',
        password: 'SecurePass123!',
        role: 'patient',
        additionalData: {
          fullName: 'John Doe',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        }
      };

      validatePassword.mockReturnValue({ isValid: true, errors: [] });
      authRepository.findProfileByEmail.mockResolvedValue(null);

      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: mockPatientData.email },
          session: { access_token: 'token-123' }
        },
        error: null
      });

      authRepository.findProfileById.mockResolvedValue({
        user_id: 'user-123',
        email: mockPatientData.email,
        role: 'patient',
        full_name: 'John Doe'
      });

      authRepository.createPatient.mockResolvedValue({
        patient_id: 'patient-123',
        user_id: 'user-123'
      });

      // Act
      const result = await authService.register(
        mockPatientData.email,
        mockPatientData.password,
        mockPatientData.role,
        mockPatientData.additionalData
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('profile');
      expect(result.user.id).toBe('user-123');
      expect(authRepository.createPatient).toHaveBeenCalledWith(
        'user-123',
        mockPatientData.additionalData
      );
    });
  });

  /**
   * User Story: US-002 - Doctor Registration
   */
  describe('Doctor Registration - Happy Path', () => {
    it('should successfully register a doctor with valid data', async () => {
      // Arrange
      const mockDoctorData = {
        email: 'doctor@test.com',
        password: 'SecurePass123!',
        role: 'doctor',
        additionalData: {
          fullName: 'Dr. Jane Smith',
          phone: '+1234567890',
          specialty: 'Cardiology',
          qualifications: 'MD, FACC',
          location: 'New York'
        }
      };

      validatePassword.mockReturnValue({ isValid: true, errors: [] });
      authRepository.findProfileByEmail.mockResolvedValue(null);

      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-456', email: mockDoctorData.email },
          session: { access_token: 'token-456' }
        },
        error: null
      });

      authRepository.findProfileById.mockResolvedValue({
        user_id: 'user-456',
        email: mockDoctorData.email,
        role: 'doctor',
        full_name: 'Dr. Jane Smith'
      });

      authRepository.createDoctor.mockResolvedValue({
        doctor_id: 'doctor-456',
        user_id: 'user-456'
      });

      // Act
      const result = await authService.register(
        mockDoctorData.email,
        mockDoctorData.password,
        mockDoctorData.role,
        mockDoctorData.additionalData
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe('user-456');
      expect(authRepository.createDoctor).toHaveBeenCalledWith(
        'user-456',
        mockDoctorData.additionalData
      );
    });
  });

  /**
   * Error Handling Tests
   * User Story: US-004 - Password Validation
   */
  describe('Registration - Password Validation Errors', () => {
    it('should reject registration with weak password', async () => {
      // Arrange
      validatePassword.mockReturnValue({
        isValid: false,
        errors: ['At least 8 characters', 'One uppercase letter']
      });

      // Act & Assert
      await expect(authService.register(
        'user@test.com',
        'weak',
        'patient',
        { fullName: 'Test User' }
      )).rejects.toThrow('Password does not meet requirements');
    });

    it('should reject password without uppercase letter', async () => {
      // Arrange
      validatePassword.mockReturnValue({
        isValid: false,
        errors: ['One uppercase letter']
      });

      // Act & Assert
      await expect(authService.register(
        'user@test.com',
        'lowercase123!',
        'patient',
        { fullName: 'Test User' }
      )).rejects.toThrow('Password does not meet requirements');
    });
  });

  /**
   * Error Handling Tests
   * User Story: US-001 - Patient Registration Validation
   */
  describe('Registration - Email Validation Errors', () => {
    it('should reject registration with invalid email format', async () => {
      // Arrange
      validatePassword.mockReturnValue({ isValid: true, errors: [] });

      // Act & Assert
      await expect(authService.register(
        'invalid-email',
        'SecurePass123!',
        'patient',
        { fullName: 'Test User' }
      )).rejects.toThrow('Invalid email format');
    });

    it('should reject registration with duplicate email', async () => {
      // Arrange
      validatePassword.mockReturnValue({ isValid: true, errors: [] });
      authRepository.findProfileByEmail.mockResolvedValue({
        user_id: 'existing-user',
        email: 'existing@test.com'
      });

      // Act & Assert
      await expect(authService.register(
        'existing@test.com',
        'SecurePass123!',
        'patient',
        { fullName: 'Test User' }
      )).rejects.toThrow('User with this email already exists');
    });
  });

  /**
   * Error Handling Tests - Missing Required Fields
   */
  describe('Registration - Required Fields Validation', () => {
    beforeEach(() => {
      validatePassword.mockReturnValue({ isValid: true, errors: [] });
      authRepository.findProfileByEmail.mockResolvedValue(null);
    });

    it('should reject registration without full name', async () => {
      // Act & Assert
      await expect(authService.register(
        'user@test.com',
        'SecurePass123!',
        'patient',
        {}
      )).rejects.toThrow('Full name is required');
    });

    it('should reject patient registration without date of birth', async () => {
      // Arrange
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'patient@test.com' },
          session: { access_token: 'token' }
        },
        error: null
      });

      authRepository.findProfileById.mockResolvedValue({
        user_id: 'user-123',
        email: 'patient@test.com',
        role: 'patient'
      });

      // Act & Assert
      await expect(authService.register(
        'patient@test.com',
        'SecurePass123!',
        'patient',
        {
          fullName: 'John Doe',
          phone: '+123456',
          gender: 'male'
          // Missing dateOfBirth
        }
      )).rejects.toThrow('Patients must provide date of birth, gender, and phone number');
    });

    it('should reject doctor registration without specialty', async () => {
      // Arrange
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-456', email: 'doctor@test.com' },
          session: { access_token: 'token' }
        },
        error: null
      });

      authRepository.findProfileById.mockResolvedValue({
        user_id: 'user-456',
        email: 'doctor@test.com',
        role: 'doctor'
      });

      // Act & Assert
      await expect(authService.register(
        'doctor@test.com',
        'SecurePass123!',
        'doctor',
        {
          fullName: 'Dr. Smith',
          location: 'New York'
          // Missing specialty
        }
      )).rejects.toThrow('Doctors must provide specialty and location');
    });
  });

  /**
   * Error Handling Tests - Invalid Role
   */
  describe('Registration - Role Validation', () => {
    it('should reject registration with admin role', async () => {
      // Act & Assert
      await expect(authService.register(
        'admin@test.com',
        'SecurePass123!',
        'admin',
        { fullName: 'Admin User' }
      )).rejects.toThrow('Invalid role');
    });

    it('should reject registration with invalid role', async () => {
      // Act & Assert
      await expect(authService.register(
        'user@test.com',
        'SecurePass123!',
        'invalid_role',
        { fullName: 'Test User' }
      )).rejects.toThrow('Invalid role');
    });
  });
});

/**
 * User Story: US-003 - User Login
 */
describe('AuthService - User Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login - Happy Path', () => {
    it('should successfully log in user with valid credentials', async () => {
      // Arrange
      const mockCredentials = {
        email: 'user@test.com',
        password: 'SecurePass123!'
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: mockCredentials.email },
          session: { access_token: 'token-123' }
        },
        error: null
      });

      authRepository.findProfileById.mockResolvedValue({
        user_id: 'user-123',
        email: mockCredentials.email,
        role: 'patient',
        full_name: 'John Doe'
      });

      // Act
      const result = await authService.login(
        mockCredentials.email,
        mockCredentials.password
      );

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('profile');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockCredentials.email,
        password: mockCredentials.password
      });
    });
  });

  describe('Login - Error Handling', () => {
    it('should reject login with invalid credentials', async () => {
      // Arrange
      const errorMessage = 'Invalid login credentials';
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error(errorMessage)
      });

      authRepository.findProfileById.mockResolvedValue(null);
      authRepository.getRoleSpecificData.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(
        'user@test.com',
        'WrongPassword'
      )).rejects.toThrow(errorMessage);
    });

    it('should handle missing email', async () => {
      // Act & Assert
      await expect(authService.login(
        '',
        'SecurePass123!'
      )).rejects.toThrow();
    });

    it('should handle missing password', async () => {
      // Act & Assert
      await expect(authService.login(
        'user@test.com',
        ''
      )).rejects.toThrow();
    });
  });
});

/**
 * User Story: US-005 - Password Reset
 */
describe('AuthService - Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Reset - Happy Path', () => {
    it('should successfully send password reset email', async () => {
      // Arrange
      const email = 'user@test.com';
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null
      });

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password')
        })
      );
    });
  });

  describe('Password Reset - Error Handling', () => {
    it('should reject invalid email format', async () => {
      // Act & Assert
      await expect(authService.forgotPassword('invalid-email'))
        .rejects.toThrow('Invalid email format');
    });

    it('should handle Supabase errors', async () => {
      // Arrange
      const errorMessage = 'Email service unavailable';
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: new Error(errorMessage)
      });

      // Act & Assert
      await expect(authService.forgotPassword('user@test.com'))
        .rejects.toThrow(errorMessage);
    });
  });
});
