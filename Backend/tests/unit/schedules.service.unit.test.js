/**
 * Unit Tests for Schedules Service (Mocked)
 */

jest.mock('../../src/features/schedules/schedules.repository');
jest.mock('../../src/features/doctors/doctors.repository');
jest.mock('../../src/features/appointments/appointments.repository');

const schedulesService = require('../../src/features/schedules/schedules.service');
const schedulesRepository = require('../../src/features/schedules/schedules.repository');
const doctorsRepository = require('../../src/features/doctors/doctors.repository');
const appointmentsRepository = require('../../src/features/appointments/appointments.repository');

describe('Schedules Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock doctor lookup by default
    doctorsRepository.findById.mockResolvedValue({
      doctor_id: 'd1',
      working_hours_start: '09:00:00',
      working_hours_end: '17:00:00'
    });
  });

  describe('getDoctorSchedules()', () => {
    it('should retrieve doctor schedules', async () => {
      const mockSchedules = [
        { schedule_id: 's1', doctor_id: 'd1', date: '2025-12-20', is_available: true },
        { schedule_id: 's2', doctor_id: 'd1', date: '2025-12-21', is_available: true }
      ];

      schedulesRepository.findAllByDoctor.mockResolvedValue(mockSchedules);

      const result = await schedulesService.getDoctorSchedules('d1');

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('getScheduleById()', () => {
    it('should retrieve schedule by ID', async () => {
      const mockSchedule = {
        schedule_id: 's1',
        doctor_id: 'd1',
        date: '2025-12-20',
        is_available: true
      };

      schedulesRepository.findById.mockResolvedValue(mockSchedule);

      const result = await schedulesService.getScheduleById('s1');

      expect(result).toEqual(mockSchedule);
    });
  });

  describe('createSchedule()', () => {
    it('should create schedule with valid data', async () => {
      const scheduleData = {
        doctorId: 'd1',
        date: '2025-12-20',
        timeSlot: '10:00-11:00',
        is_available: true
      };

      const mockSchedule = { schedule_id: 's1', ...scheduleData };

      schedulesRepository.create.mockResolvedValue(mockSchedule);

      const result = await schedulesService.createSchedule(scheduleData);

      expect(result).toEqual(mockSchedule);
    });
  });

  describe('updateSchedule()', () => {
    it('should update schedule', async () => {
      const updates = { is_available: false };
      const mockUpdated = { schedule_id: 's1', doctor_id: 'd1', ...updates };

      schedulesRepository.update.mockResolvedValue(mockUpdated);

      const result = await schedulesService.updateSchedule('s1', updates);

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteSchedule()', () => {
    it('should delete schedule', async () => {
      schedulesRepository.findById.mockResolvedValue({ schedule_id: 's1' });
      schedulesRepository.remove.mockResolvedValue({ success: true });

      const result = await schedulesService.deleteSchedule('s1');

      expect(result.success).toBe(true);
    });
  });

  // Note: getAvailableSlots(), isSlotAvailable(), and blockTime() use direct Supabase
  // queries instead of repository methods, so they're tested in integration tests
});
