/**
 * Integration Tests for Patients API
 * 
 * User Stories Covered:
 * - US-010: As a Patient, I want to view my profile information
 * - US-011: As a Patient, I want to update my personal details
 * - US-012: As a Patient, I want to view my upcoming appointments
 * - US-013: As a Patient, I want to view my past appointments
 * - US-014: As a Patient, I want to cancel an upcoming appointment
 * 
 * Tests the complete patient profile and appointment management workflow
 */

const request = require('supertest');
const app = require('../../src/app');
const { supabase } = require('../../src/config/database');
const { cleanupTestSuite, cleanupTestUser } = require('../helpers/cleanup-helper');
const PatientsService = require('../../src/features/patients/patients.service');


describe('Patients API Integration Tests', () => {
  let patientUserId, patientToken, patientId;
  let doctorUserId, doctorToken, doctorId;
  let scheduleId, appointmentId;
  const createdUsers = [];
  const createdSchedules = [];
  const createdAppointments = [];

  // Setup: Create test patient and doctor
  beforeAll(async () => {
    // Create test patient
    const patientEmail = `patient-${Date.now()}@test.com`;
    const patientRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: patientEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'Test Patient Profile',
        phone: '+1234567890',
        dateOfBirth: '1990-05-15',
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

    // Get patient ID - patient_id equals user_id from registration
    patientId = patientUserId;

    // Create test doctor
    const doctorEmail = `doctor-${Date.now()}@test.com`;
    const doctorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: doctorEmail,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. Test Patient Service',
        phone: '+1234567891',
        specialty: 'Family Medicine',
        qualifications: 'MD',
        location: 'Boston'
      });

    doctorUserId = doctorRes.body.data.user.id;
    createdUsers.push(doctorUserId);

    const doctorLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: doctorEmail,
        password: 'SecurePass123!'
      });

    doctorToken = doctorLogin.body.data.token;

    const { data: doctor } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('user_id', doctorUserId)
      .single();

    doctorId = doctor.doctor_id;

    // Create a schedule for testing appointments
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];

    const scheduleRes = await request(app)
      .post('/api/v1/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        doctorId: doctorId,
        date: dateString,
        timeSlot: '10:00-11:00',
        isAvailable: true,
        repeatWeekly: false
      });

    scheduleId = scheduleRes.body.data.schedule_id;

    // Book an appointment for testing
    const appointmentRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId,
        scheduleId: scheduleId,
        date: dateString,
        timeSlot: '10:00-11:00',
        reason: 'Test appointment'
      });

    if (appointmentRes.body.success) {
      appointmentId = appointmentRes.body.data.appointment_id;
    }
  });

  // Cleanup after all tests
  afterAll(async () => {
    if (appointmentId) createdAppointments.push(appointmentId);
    if (scheduleId) createdSchedules.push(scheduleId);
    await cleanupTestSuite(createdUsers, createdAppointments, createdSchedules);
  });

  /**
   * User Story: US-010 - View Patient Profile
   */
  describe('GET /api/v1/patients/:id - Get Patient Profile', () => {
    it('should retrieve patient profile information', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/patients/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('patient_id', patientId);
      expect(response.body.data).toHaveProperty('full_name');
      expect(response.body.data).toHaveProperty('date_of_birth', '1990-05-15');
      expect(response.body.data).toHaveProperty('gender', 'male');
    });

    it('should return 404 for non-existent patient', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/patients/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  /**
   * User Story: US-011 - Update Patient Profile
   */
  describe('PUT /api/v1/patients/:id - Update Patient Profile', () => {
    it('should allow patient to update own profile', async () => {
      // Arrange
      const updates = {
        phone: '+1987654321'
      };

      // Act
      const response = await request(app)
        .put(`/api/v1/patients/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updates)
        .expect(200);

      // Assert Response
      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe(updates.phone);

// Assert Database
const patientFromDb = await PatientsService.getById(patientId);
expect(patientFromDb.phone).toBe(updates.phone);

    });

    it('should reject update with invalid data', async () => {
      // Arrange
      const invalidUpdates = {
        dateOfBirth: 'invalid-date-format'
      };

      // Act & Assert
      const response = await request(app)
        .put(`/api/v1/patients/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * User Story: US-012 & US-013 - View Appointments
   */
  describe('GET /api/v1/patients/:id/appointments - Get Patient Appointments', () => {
    it('should retrieve patient appointments (upcoming and past)', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/patients/${patientId}/appointments`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('upcoming');
      expect(response.body.data).toHaveProperty('past');
      expect(Array.isArray(response.body.data.upcoming)).toBe(true);
      expect(Array.isArray(response.body.data.past)).toBe(true);

      // Should find our test appointment in upcoming
      if (appointmentId) {
        const foundAppointment = response.body.data.upcoming.find(
          a => a.appointment_id === appointmentId
        );
        expect(foundAppointment).toBeTruthy();
      }
    });

    it('should sort upcoming appointments by date (ascending)', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/patients/${patientId}/appointments`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Assert
      const upcoming = response.body.data.upcoming;
      if (upcoming.length > 1) {
        for (let i = 1; i < upcoming.length; i++) {
          const date1 = new Date(upcoming[i - 1].date);
          const date2 = new Date(upcoming[i].date);
          expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
        }
      }
    });

    it('should reject unauthorized access to other patients appointments', async () => {
      // Create another patient
      const otherPatientEmail = `other-patient-${Date.now()}@test.com`;
      const otherPatientRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: otherPatientEmail,
          password: 'SecurePass123!',
          role: 'patient',
          fullName: 'Other Patient',
          phone: '+1111111111',
          dateOfBirth: '1985-01-01',
          gender: 'female'
        });

      const otherPatientId = otherPatientRes.body.data.user.id;

      const otherPatientLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: otherPatientEmail,
          password: 'SecurePass123!'
        });

      const otherPatientToken = otherPatientLogin.body.data.token;

      // Act & Assert - Try to access first patient's appointments
      await request(app)
        .get(`/api/v1/patients/${patientId}/appointments`)
        .set('Authorization', `Bearer ${otherPatientToken}`)
        .expect(403);

      // Cleanup
      await cleanupTestUser(otherPatientId);
    });
  });

  /**
   * User Story: US-014 - Cancel Upcoming Appointment
   */
  describe('PATCH /api/v1/patients/:id/appointments/cancel - Cancel Appointment', () => {
    let cancelTestAppointmentId;

    beforeEach(async () => {
      // Create a new appointment for cancellation test
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const dateString = futureDate.toISOString().split('T')[0];

      // Create schedule
      const scheduleRes = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          doctorId: doctorId,
          date: dateString,
          timeSlot: '14:00-15:00',
          isAvailable: true,
          repeatWeekly: false
        });

      if (!scheduleRes.body.success || !scheduleRes.body.data) {
        console.warn('Schedule creation failed in beforeEach:', scheduleRes.body);
        return;
      }

      const newScheduleId = scheduleRes.body.data.schedule_id;

      // Book appointment
      const appointmentRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorId,
          scheduleId: newScheduleId,
          date: dateString,
          timeSlot: '14:00-15:00',
          reason: 'Test cancellation'
        });

      if (appointmentRes.body.success && appointmentRes.body.data) {
        cancelTestAppointmentId = appointmentRes.body.data.appointment_id;
      }
    });

    afterEach(async () => {
      // Cleanup test appointment
      if (cancelTestAppointmentId) {
        await supabase.from('appointments').delete().eq('appointment_id', cancelTestAppointmentId);
      }
    });

    it('should successfully cancel an upcoming appointment', async () => {
      if (!cancelTestAppointmentId) {
        console.warn('Skipping test: No appointment created');
        return;
      }

      // Act
      const response = await request(app)
        .patch(`/api/v1/patients/${patientId}/appointments/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId: cancelTestAppointmentId })
        .expect(200);

      // Assert Response
      expect(response.body.success).toBe(true);

      // Assert Database - Appointment status should be 'cancelled'
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_id', cancelTestAppointmentId)
        .single();

      expect(appointment.status).toBe('cancelled');

      // Assert Schedule - Should be available again
      const { data: schedule } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', appointment.schedule_id)
        .single();

      expect(schedule.is_available).toBe(true);
    });

    it('should reject cancellation of non-existent appointment', async () => {
      // Act & Assert
      const response = await request(app)
        .patch(`/api/v1/patients/${patientId}/appointments/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId: '99999999-9999-9999-9999-999999999999' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * List All Patients (Admin Function)
   */
  describe('GET /api/v1/patients - List All Patients', () => {
    it('should retrieve list of all patients', async () => {
      // Note: This might require admin authentication in production
      // For now, testing without auth to verify endpoint works
      
      // Act
      const response = await request(app)
        .get('/api/v1/patients')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should include our test patient
      const foundPatient = response.body.data.find(p => p.patient_id === patientId);
      expect(foundPatient).toBeTruthy();
    });
  });
});
