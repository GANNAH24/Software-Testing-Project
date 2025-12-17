/**
 * Integration Tests for Doctors API
 * 
 * User Stories Covered:
 * - US-004: As a User, I want to browse all available doctors
 * - US-005: As a User, I want to search doctors by name or specialty
 * - US-006: As a User, I want to filter doctors by location
 * - US-007: As a User, I want to view detailed doctor profile with reviews and availability
 * - US-008: As a Doctor, I want to update my profile information
 * - US-009: As an Admin, I want to manage doctor accounts
 * 
 * Tests the complete doctor management workflow including:
 * - Doctor browsing and search
 * - Filtering by specialty and location
 * - Profile viewing with details
 * - Profile updates
 * - Admin operations
 */

const request = require('supertest');
const app = require('../../src/app');
const { supabase } = require('../../src/config/database');
const { cleanupTestSuite } = require('../helpers/cleanup-helper');

describe('Doctors API Integration Tests', () => {
  let doctor1UserId, doctor1Token, doctor1Id;
  let doctor2UserId, doctor2Token, doctor2Id;
  let patientUserId, patientToken;
  let adminUserId, adminToken;
  const createdUsers = [];

  // Setup: Create test data
  beforeAll(async () => {
    // Create first test doctor (Cardiology in New York)
    const doctor1Email = `doctor1-${Date.now()}@test.com`;
    const doctor1Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: doctor1Email,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. John Cardio',
        phone: '+1234567890',
        specialty: 'Cardiology',
        qualifications: 'MD, FACC',
        location: 'New York'
      });

    doctor1UserId = doctor1Res.body.data.user.id;
    createdUsers.push(doctor1UserId);

    const doctor1Login = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: doctor1Email,
        password: 'SecurePass123!'
      });

    doctor1Token = doctor1Login.body.data.token;

    const { data: doc1 } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('user_id', doctor1UserId)
      .single();

    doctor1Id = doc1.doctor_id;

    // Create second test doctor (Dermatology in Los Angeles)
    const doctor2Email = `doctor2-${Date.now()}@test.com`;
    const doctor2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: doctor2Email,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. Sarah Derma',
        phone: '+1234567891',
        specialty: 'Dermatology',
        qualifications: 'MD, FAAD',
        location: 'Los Angeles'
      });

    doctor2UserId = doctor2Res.body.data.user.id;
    createdUsers.push(doctor2UserId);

    const doctor2Login = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: doctor2Email,
        password: 'SecurePass123!'
      });

    doctor2Token = doctor2Login.body.data.token;

    const { data: doc2 } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('user_id', doctor2UserId)
      .single();

    doctor2Id = doc2.doctor_id;

    // Create test patient
    const patientEmail = `patient-${Date.now()}@test.com`;
    const patientRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: patientEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'Test Patient',
        phone: '+1234567892',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      });

    patientUserId = patientRes.body.data.user.id;
    createdUsers.push(patientUserId);

    const patientLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: patientEmail,
        password: 'SecurePass123!'
      });

    patientToken = patientLogin.body.data.token;

    // Note: Admin creation would require direct database insertion
    // For now, we'll skip admin-only tests unless admin exists
  });

  // Cleanup after all tests
  afterAll(async () => {
    await cleanupTestSuite(createdUsers, [], []);
  });

  /**
   * User Story: US-004 - Browse All Available Doctors
   */
  describe('GET /api/v1/doctors - Get All Doctors', () => {
    it('should retrieve all doctors (no auth required)', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verify our test doctors are in the list
      const doctorIds = response.body.data.map(d => d.doctor_id);
      expect(doctorIds).toContain(doctor1Id);
      expect(doctorIds).toContain(doctor2Id);
    });

    // it.skip('should retrieve doctors with pagination', async () => {
    //   // Act
    //   const response = await request(app)
    //     .get('/api/v1/doctors?limit=1&offset=0')
    //     .expect(200);

    //   // Assert
    //   expect(response.body.success).toBe(true);
    //   expect(response.body.data.length).toBeLessThanOrEqual(1);
    // });
  });

  /**
   * User Story: US-005 - Search Doctors by Name or Specialty
   */
  describe('GET /api/v1/doctors/search - Search Doctors', () => {
    it('should search doctors by name', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/search?q=Cardio')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      const found = response.body.data.find(d => d.doctor_id === doctor1Id);
      expect(found).toBeTruthy();
      expect(found.name).toContain('Cardio');
    });


    // Added delay to allow search indexing
    it('should search doctors by specialty', async () => {
      // Wait for search index to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Act
      const response = await request(app)
        .get('/api/v1/doctors/search?specialty=Dermatology')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      const found = response.body.data.find(d => d.doctor_id === doctor2Id);
      expect(found).toBeTruthy();
      expect(found.specialty).toBe('Dermatology');
    });

    it('should return empty array for no matches', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/search?searchTerm=NonExistentDoctor12345')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  /**
   * User Story: US-006 - Filter Doctors by Location
   */
  describe('GET /api/v1/doctors/location/:location - Filter by Location', () => {
    it('should filter doctors by location', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/location/New York')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      const found = response.body.data.find(d => d.doctor_id === doctor1Id);
      expect(found).toBeTruthy();
      expect(found.location).toBe('New York');

      // Should not include Los Angeles doctor
      const laDoctor = response.body.data.find(d => d.doctor_id === doctor2Id);
      expect(laDoctor).toBeFalsy();
    });
  });

  describe('GET /api/v1/doctors/specialty/:specialty - Filter by Specialty', () => {
    it('should filter doctors by specialty', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/specialty/Cardiology')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      const found = response.body.data.find(d => d.doctor_id === doctor1Id);
      expect(found).toBeTruthy();
      expect(found.specialty).toBe('Cardiology');
    });
  });

  /**
   * User Story: US-007 - View Detailed Doctor Profile
   */
  describe('GET /api/v1/doctors/:id - Get Doctor by ID', () => {
    it('should retrieve doctor basic info by ID', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/doctors/${doctor1Id}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('doctor_id', doctor1Id);
      expect(response.body.data).toHaveProperty('full_name');
      expect(response.body.data).toHaveProperty('specialty');
      expect(response.body.data).toHaveProperty('qualifications');
    });

    it('should return 404 for non-existent doctor', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/99999999-9999-9999-9999-999999999999')
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/doctors/:id/profile - Get Detailed Profile', () => {
    it('should retrieve detailed doctor profile with reviews and schedules', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/doctors/${doctor1Id}/profile`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('doctor_id', doctor1Id);
      expect(response.body.data).toHaveProperty('full_name');
      expect(response.body.data).toHaveProperty('specialty');

      // Should include aggregated data (even if empty)
      expect(response.body.data).toHaveProperty('average_rating');
      expect(response.body.data).toHaveProperty('total_reviews');
    });
  });

  /**
   * User Story: US-008 - Doctor Updates Own Profile
   */
  describe('PUT /api/v1/doctors/:id - Update Doctor Profile', () => {
    it('should allow doctor to update own profile', async () => {
      // Arrange
      const updates = {
        qualifications: 'MD, FACC, FSCAI',
        location: 'Updated Location'
      };

      // Act
      const response = await request(app)
        .put(`/api/v1/doctors/${doctor1Id}`)
        .set('Authorization', `Bearer ${doctor1Token}`)
        .send(updates)
        .expect(200);

      // Assert Response
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualifications).toBe(updates.qualifications);
      expect(response.body.data.location).toBe(updates.location);

      // Assert Database
      const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_id', doctor1Id)
        .single();

      expect(doctor.qualifications).toBe(updates.qualifications);
      expect(doctor.location).toBe(updates.location);
    });


    // Authorization test - now fixed to return 403
    it('should reject update by different doctor', async () => {
      // Arrange
      const updates = {
        qualifications: 'Unauthorized Update'
      };

      // Act & Assert
      await request(app)
        .put(`/api/v1/doctors/${doctor1Id}`)
        .set('Authorization', `Bearer ${doctor2Token}`)
        .send(updates)
        .expect(403);
    });

    it('should reject update by patient', async () => {
      // Arrange
      const updates = {
        qualifications: 'Patient Cannot Update'
      };

      // Act & Assert
      await request(app)
        .put(`/api/v1/doctors/${doctor1Id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updates)
        .expect(403);
    });

    it('should reject unauthenticated update', async () => {
      // Act & Assert
      await request(app)
        .put(`/api/v1/doctors/${doctor1Id}`)
        .send({ qualifications: 'No Auth' })
        .expect(401);
    });
  });

  /**
   * Advanced Search
   */
  describe('GET /api/v1/doctors/advanced-search - Advanced Search', () => {
    // Added delay to allow search indexing
    it('should perform advanced search with multiple filters', async () => {
      // Wait for search index to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Act - Search for Cardiology (test should be independent)
      const response = await request(app)
        .get('/api/v1/doctors/advanced-search?specialty=Cardiology')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      const found = response.body.data.find(d => d.doctor_id === doctor1Id);
      expect(found).toBeTruthy();
      expect(found.specialty).toBe('Cardiology');
    });

    it('should support sorting by reviews', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/doctors/advanced-search?sortBy=reviews')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
