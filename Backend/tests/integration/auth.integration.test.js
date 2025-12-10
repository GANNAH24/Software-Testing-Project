/**
 * Integration Tests for Authentication API
 * 
 * User Stories Covered:
 * - US-001: As a Patient, I want to register with my personal details
 * - US-002: As a Doctor, I want to register with my professional details
 * - US-003: As a User, I want to log in with my email and password
 * 
 * Tests the full flow from HTTP request to database and back
 * Validates that the presentation, business, and data layers work together correctly
 */

const request = require('supertest');
const app = require('../../src/app');
const { supabase } = require('../../src/config/database');

describe('Authentication API Integration Tests', () => {
  let testUserId;
  let testEmail;

  // Cleanup after each test
  afterEach(async () => {
    if (testUserId) {
      // Clean up test data
      await supabase.from('users').delete().eq('user_id', testUserId);
      testUserId = null;
    }
  });

  /**
   * User Story: US-001 - Patient Registration Integration
   */
  describe('POST /api/v1/auth/register - Patient Registration', () => {
    it('should successfully register a patient with complete flow', async () => {
      // Arrange
      testEmail = `patient-${Date.now()}@test.com`;
      const registrationData = {
        email: testEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'Integration Test Patient',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert Response
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.role).toBe('patient');

      testUserId = response.body.data.user.id;

      // Assert Database State
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(profile).toBeTruthy();
      expect(profile.email).toBe(testEmail);
      expect(profile.role).toBe('patient');

      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(patient).toBeTruthy();
      expect(patient.date_of_birth).toBe('1990-01-01');
      expect(patient.gender).toBe('male');
    });

    it('should reject duplicate email registration', async () => {
      // Arrange
      testEmail = `duplicate-${Date.now()}@test.com`;
      const registrationData = {
        email: testEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'First User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      // Act - First registration
      const firstResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect(201);

      testUserId = firstResponse.body.data.user.id;

      // Act - Attempt duplicate registration
      const duplicateResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect(400);

      // Assert
      expect(duplicateResponse.body).toHaveProperty('error');
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should reject registration with weak password', async () => {
      // Arrange
      const registrationData = {
        email: `weak-pass-${Date.now()}@test.com`,
        password: 'weak',
        role: 'patient',
        fullName: 'Test User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password');
    });
  });

  /**
   * User Story: US-002 - Doctor Registration Integration
   */
  describe('POST /api/v1/auth/register - Doctor Registration', () => {
    it('should successfully register a doctor with complete flow', async () => {
      // Arrange
      testEmail = `doctor-${Date.now()}@test.com`;
      const registrationData = {
        email: testEmail,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. Integration Test',
        phone: '+1234567890',
        specialty: 'Cardiology',
        qualifications: 'MD, FACC',
        location: 'New York'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect(201);

      // Assert Response
      expect(response.body.data.user.role).toBe('doctor');
      testUserId = response.body.data.user.id;

      // Assert Database State
      const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(doctor).toBeTruthy();
      expect(doctor.specialty).toBe('Cardiology');
      expect(doctor.qualifications).toBe('MD, FACC');
      expect(doctor.location).toBe('New York');
    });

    it('should reject doctor registration without specialty', async () => {
      // Arrange
      const registrationData = {
        email: `doctor-no-spec-${Date.now()}@test.com`,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. Test',
        phone: '+1234567890',
        location: 'New York'
        // Missing specialty
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message.toLowerCase()).toContain('specialty');
    });
  });

  /**
   * User Story: US-003 - User Login Integration
   */
  describe('POST /api/v1/auth/login - User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      testEmail = `login-test-${Date.now()}@test.com`;
      const registrationData = {
        email: testEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'Login Test User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationData);

      testUserId = response.body.data.user.id;
    });

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: testEmail,
        password: 'SecurePass123!'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testEmail);

      // Check for authentication cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      // Arrange
      const loginData = {
        email: testEmail,
        password: 'WrongPassword123!'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'SecurePass123!'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Session Management Integration
   */
  describe('GET /api/v1/auth/me - Get Current User', () => {
    let authToken;

    beforeEach(async () => {
      // Register and login a test user
      testEmail = `session-test-${Date.now()}@test.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'SecurePass123!',
          role: 'patient',
          fullName: 'Session Test User',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'SecurePass123!'
        });

      testUserId = loginResponse.body.data.user.id;
      authToken = loginResponse.body.data.session.access_token;
    });

    it('should return current user data with valid session', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it('should reject request without authentication', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message.toLowerCase()).toContain('unauthorized');
    });

    it('should reject request with invalid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Logout Integration
   */
  describe('POST /api/v1/auth/logout - User Logout', () => {
    let authToken;

    beforeEach(async () => {
      testEmail = `logout-test-${Date.now()}@test.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'SecurePass123!',
          role: 'patient',
          fullName: 'Logout Test User',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'SecurePass123!'
        });

      testUserId = loginResponse.body.data.user.id;
      authToken = loginResponse.body.data.session.access_token;
    });

    it('should successfully logout authenticated user', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);

      // Verify session is invalidated
      const meResponse = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });
});
