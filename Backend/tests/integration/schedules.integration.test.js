/**
 * Integration Tests for Schedules API
 * 
 * User Stories Covered:
 * - US-018: As a Doctor, I want to create my availability schedule with specific dates and time slots
 * - US-019: As a Doctor, I want to set recurring weekly schedules
 * - US-020: As a Doctor, I want to be prevented from creating conflicting time slots
 * - US-021: As a Doctor, I want to update or delete my schedules
 * - US-022: As a Doctor, I want to mark time slots as available or unavailable
 * 
 * Tests the complete schedule management workflow including:
 * - Creating single and recurring schedules
 * - Conflict detection
 * - Schedule updates
 * - Availability toggling
 * - Schedule deletion
 */

const request = require('supertest');
const app = require('../../src/app');
const { supabase } = require('../../src/config/database');
const { cleanupTestSuite } = require('../helpers/cleanup-helper');

describe('Schedules API Integration Tests', () => {
  let doctorUserId, doctorToken, doctorId;
  let patientUserId, patientToken;
  const createdUsers = [];
  const createdSchedules = [];
  const createdAppointments = [];

  // Setup: Create test doctor and patient
  beforeAll(async () => {
    // Create test doctor
    const doctorEmail = `doctor-${Date.now()}@test.com`;
    const doctorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: doctorEmail,
        password: 'SecurePass123!',
        role: 'doctor',
        fullName: 'Dr. Test Schedule',
        phone: '+1234567890',
        specialty: 'General Medicine',
        qualifications: 'MD',
        location: 'Test City'
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

    // Get doctor ID
    const { data: doctor } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('user_id', doctorUserId)
      .single();

    doctorId = doctor.doctor_id;

    // Create test patient for authorization tests
    const patientEmail = `patient-${Date.now()}@test.com`;
    const patientRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: patientEmail,
        password: 'SecurePass123!',
        role: 'patient',
        fullName: 'Test Patient',
        phone: '+1234567890',
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
  });

  // Cleanup after all tests
  afterAll(async () => {
    await cleanupTestSuite(createdUsers, createdAppointments, createdSchedules);
  });

  /**
   * User Story: US-018 - Create Schedule with Specific Dates and Time Slots
   */
  describe('POST /api/v1/schedules - Create Schedule', () => {
    it('should successfully create a single schedule', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];

      const scheduleData = {
        date: dateString,
        time_slot: '09:00-10:00',
        is_available: true,
        repeat_weekly: false
      };

      // Act
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(scheduleData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert Response
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('schedule_id');
      expect(response.body.data.time_slot).toBe('09:00-10:00');
      expect(response.body.data.is_available).toBe(true);

      // Assert Database State
      const { data: schedule } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', response.body.data.schedule_id)
        .single();

      expect(schedule).toBeTruthy();
      expect(schedule.doctor_id).toBe(doctorId);
      expect(schedule.date).toBe(dateString);
    });

    it('should reject schedule creation by non-doctor', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];

      const scheduleData = {
        doctorId: doctorId,
        date: dateString,
        timeSlot: '10:00-11:00',
        isAvailable: true,
        repeatWeekly: false
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(scheduleData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid time slot format', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];

      const scheduleData = {
        doctorId: doctorId,
        date: dateString,
        timeSlot: '25:00-26:00', // Invalid time
        isAvailable: true,
        repeatWeekly: false
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(scheduleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid time slot format');
    });
  });

  /**
   * User Story: US-019 - Set Recurring Weekly Schedules
   */
  describe('POST /api/v1/schedules - Recurring Schedules', () => {
    it('should create 12 weeks of recurring schedules', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14); // Start 2 weeks out
      const dateString = futureDate.toISOString().split('T')[0];

      const scheduleData = {
        doctorId: doctorId,
        date: dateString,
        timeSlot: '14:00-15:00',
        isAvailable: true,
        repeatWeekly: true
      };

      // Act
      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(scheduleData)
        .expect(201);

      // Assert Response
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(12);

      // Assert Database State
      const { data: schedules, count } = await supabase
        .from('doctor_schedules')
        .select('*', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .eq('time_slot', '14:00-15:00');

      expect(count).toBeGreaterThanOrEqual(12);

      // Verify dates are 7 days apart
      const dates = response.body.data.map(s => new Date(s.date)).sort((a, b) => a - b);
      for (let i = 1; i < dates.length; i++) {
        const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(7);
      }
    });
  });

  /**
   * User Story: US-020 - Prevent Conflicting Time Slots
   */
  describe('POST /api/v1/schedules - Conflict Detection', () => {
    it('should reject schedule with conflicting time slot', async () => {
      // Arrange - Create first schedule
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 21);
      const dateString = futureDate.toISOString().split('T')[0];

      const firstSchedule = {
        doctorId: doctorId,
        date: dateString,
        timeSlot: '11:00-12:00',
        isAvailable: true,
        repeatWeekly: false
      };

      await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(firstSchedule)
        .expect(201);

      // Act - Try to create conflicting schedule
      const conflictingSchedule = {
        doctorId: doctorId,
        date: dateString,
        timeSlot: '11:30-12:30', // Overlaps with 11:00-12:00
        isAvailable: true,
        repeatWeekly: false
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(conflictingSchedule)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('conflicts');
    });
  });

  /**
   * User Story: US-021 - Update or Delete Schedules
   */
  describe('PATCH /api/v1/schedules/:id - Update Schedule', () => {
    let scheduleId;

    beforeEach(async () => {
      // Create a schedule to update
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 28);
      const dateString = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          doctorId: doctorId,
          date: dateString,
          timeSlot: '15:00-16:00',
          isAvailable: true,
          repeatWeekly: false
        });

      scheduleId = response.body.data.schedule_id;
    });

    it('should successfully update schedule time slot', async () => {
      // Arrange
      const updates = {
        timeSlot: '16:00-17:00'
      };

      // Act
      const response = await request(app)
        .patch(`/api/v1/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.time_slot).toBe('16:00-17:00');

      // Assert Database
      const { data: schedule } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

      expect(schedule.time_slot).toBe('16:00-17:00');
    });

    it('should reject update by non-doctor', async () => {
      // Act & Assert
      await request(app)
        .patch(`/api/v1/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ timeSlot: '17:00-18:00' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/schedules/:id - Delete Schedule', () => {
    let scheduleId;

    beforeEach(async () => {
      // Create a schedule to delete
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 35);
      const dateString = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          doctorId: doctorId,
          date: dateString,
          timeSlot: '08:00-09:00',
          isAvailable: true,
          repeatWeekly: false
        });

      scheduleId = response.body.data.schedule_id;
    });

    it('should successfully delete schedule', async () => {
      // Act
      const response = await request(app)
        .delete(`/api/v1/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      // Assert Response
      expect(response.body.success).toBe(true);

      // Assert Database - Schedule should be deleted
      const { data: schedule } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

      expect(schedule).toBeNull();
    });

    it('should reject delete by non-doctor', async () => {
      // Act & Assert
      await request(app)
        .delete(`/api/v1/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      // Verify schedule still exists
      const { data: schedule } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

      expect(schedule).toBeTruthy();
    });
  });

  /**
   * User Story: US-022 - Mark Time Slots Available/Unavailable
   */
  describe('PATCH /api/v1/schedules/:id - Toggle Availability', () => {
    let farFutureScheduleId, nearFutureScheduleId;

    beforeEach(async () => {
      // Create schedule far in future (can toggle)
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 30);
      const farDateString = farFuture.toISOString().split('T')[0];

      const farResponse = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: farDateString,
          time_slot: '10:00-11:00',
          is_available: true,
          repeat_weekly: false
        });

      if (!farResponse.body.data) {
        console.error('Far schedule creation failed:', farResponse.body);
        throw new Error('Failed to create far future schedule');
      }
      farFutureScheduleId = farResponse.body.data.schedule_id;
      createdSchedules.push(farFutureScheduleId);

      // Create schedule in near future (within 24 hours - cannot toggle)
      const nearFuture = new Date();
      nearFuture.setHours(nearFuture.getHours() + 12);
      const nearDateString = nearFuture.toISOString().split('T')[0];

      const nearResponse = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: nearDateString,
          time_slot: '11:00-12:00',
          is_available: true,
          repeat_weekly: false
        });

      if (!nearResponse.body.data) {
        console.error('Near schedule creation failed:', nearResponse.body);
        throw new Error('Failed to create near future schedule');
      }
      nearFutureScheduleId = nearResponse.body.data.schedule_id;
      createdSchedules.push(nearFutureScheduleId);
    });

    afterEach(async () => {
      // Clean up schedules created in beforeEach
      if (farFutureScheduleId) {
        await supabase.from('doctor_schedules').delete().eq('schedule_id', farFutureScheduleId);
        farFutureScheduleId = null;
      }
      if (nearFutureScheduleId) {
        await supabase.from('doctor_schedules').delete().eq('schedule_id', nearFutureScheduleId);
        nearFutureScheduleId = null;
      }
    });

    it('should toggle availability for schedule >24 hours away', async () => {
      // Act
      const response = await request(app)
        .patch(`/api/v1/schedules/${farFutureScheduleId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ is_available: false })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_available).toBe(false);
    });

    it('should reject availability toggle within 24 hours', async () => {
      // Act & Assert
      const response = await request(app)
        .patch(`/api/v1/schedules/${nearFutureScheduleId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ is_available: false })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('24 hours');
    });
  });

  /**
   * GET /api/v1/schedules - Retrieve Schedules
   */
  describe('GET /api/v1/schedules - Get All Schedules', () => {
    it('should retrieve all schedules (authenticated)', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/schedules')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject unauthenticated access', async () => {
      // Act & Assert
      await request(app)
        .get('/api/v1/schedules')
        .expect(401);
    });
  });
});
