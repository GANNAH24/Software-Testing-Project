/**
 * Unit Tests for Schedules Service
 * 
 * User Stories Covered:
 * - US-018: As a Doctor, I want to create my availability schedule with specific dates and time slots
 * - US-019: As a Doctor, I want to set recurring weekly schedules
 * - US-020: As a Doctor, I want to be prevented from creating conflicting time slots
 * - US-021: As a Doctor, I want to update or delete my schedules
 * - US-022: As a Doctor, I want to mark time slots as available or unavailable
 */

const schedulesService = require('../../src/features/schedules/schedules.service');
const schedulesRepository = require('../../src/features/schedules/schedules.repository');

// Mock dependencies
jest.mock('../../src/features/schedules/schedules.repository');
jest.mock('../../src/shared/utils/logger.util', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('SchedulesService - Create Schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * User Story: US-018 - Create Availability Schedule
   */
  describe('Create Schedule - Happy Path', () => {
    it('should successfully create a single schedule', async () => {
      // Arrange
      const mockScheduleData = {
        doctorId: 'doctor-123',
        date: '2025-12-15',
        timeSlot: '10:00-11:00',
        isAvailable: true,
        repeatWeekly: false
      };

      const mockCreatedSchedule = {
        schedule_id: 'schedule-789',
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      };

      schedulesRepository.checkConflicts.mockResolvedValue(false);
      schedulesRepository.create.mockResolvedValue(mockCreatedSchedule);

      // Act
      const result = await schedulesService.createSchedule(mockScheduleData);

      // Assert
      expect(result).toHaveProperty('schedule_id');
      expect(result.doctor_id).toBe(mockScheduleData.doctorId);
      expect(result.time_slot).toBe(mockScheduleData.timeSlot);
      expect(schedulesRepository.checkConflicts).toHaveBeenCalled();
      expect(schedulesRepository.create).toHaveBeenCalledWith(mockScheduleData);
    });
  });

  /**
   * User Story: US-019 - Set Recurring Weekly Schedules
   */
  describe('Create Recurring Schedule - Happy Path', () => {
    it('should create 12 weeks of recurring schedules', async () => {
      // Arrange
      const mockScheduleData = {
        doctorId: 'doctor-123',
        date: '2025-12-15',
        timeSlot: '10:00-11:00',
        isAvailable: true,
        repeatWeekly: true
      };

      schedulesRepository.checkConflicts.mockResolvedValue(false);
      schedulesRepository.create.mockImplementation((data) => ({
        schedule_id: `schedule-${Date.now()}`,
        doctor_id: data.doctorId,
        date: data.date,
        time_slot: data.timeSlot,
        is_available: data.isAvailable
      }));

      // Act
      const result = await schedulesService.createSchedule(mockScheduleData);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(12);
      expect(schedulesRepository.create).toHaveBeenCalledTimes(12);
      
      // Verify dates are 7 days apart
      const firstDate = new Date(result[0].date);
      const secondDate = new Date(result[1].date);
      const daysDiff = (secondDate - firstDate) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });
  });

  /**
   * User Story: US-020 - Prevent Conflicting Time Slots
   */
  describe('Create Schedule - Conflict Detection', () => {
    it('should reject schedule creation when conflicts exist', async () => {
      // Arrange
      const mockScheduleData = {
        doctorId: 'doctor-123',
        date: '2025-12-15',
        timeSlot: '10:00-11:00',
        isAvailable: true
      };

      schedulesRepository.checkConflicts.mockResolvedValue(true);

      // Act & Assert
      await expect(schedulesService.createSchedule(mockScheduleData))
        .rejects.toThrow('Schedule conflicts with existing time slots');
      expect(schedulesRepository.create).not.toHaveBeenCalled();
    });

    it('should validate time slot format', async () => {
      // Arrange
      const invalidScheduleData = {
        doctorId: 'doctor-123',
        date: '2025-12-15',
        timeSlot: 'invalid-format',
        isAvailable: true
      };

      // Act & Assert
      await expect(schedulesService.createSchedule(invalidScheduleData))
        .rejects.toThrow('Invalid time slot format');
    });

    it('should accept valid time slot formats', async () => {
      // Arrange
      const validTimeSlots = ['09:00-10:00', '14:30-15:30', '23:00-23:59'];
      
      schedulesRepository.checkConflicts.mockResolvedValue(false);
      schedulesRepository.create.mockResolvedValue({
        schedule_id: 'schedule-123',
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '',
        is_available: true
      });

      // Act & Assert
      for (const timeSlot of validTimeSlots) {
        await expect(schedulesService.createSchedule({
          doctorId: 'doctor-123',
          date: '2025-12-15',
          timeSlot: timeSlot,
          isAvailable: true
        })).resolves.toBeDefined();
      }
    });

    it('should reject invalid time slot formats', async () => {
      // Arrange
      const invalidTimeSlots = ['25:00-26:00', '10:60-11:00', '10-11', 'morning'];

      // Act & Assert
      for (const timeSlot of invalidTimeSlots) {
        await expect(schedulesService.createSchedule({
          doctorId: 'doctor-123',
          date: '2025-12-15',
          timeSlot: timeSlot,
          isAvailable: true
        })).rejects.toThrow('Invalid time slot format');
      }
    });
  });
});

/**
 * User Story: US-021 - Update or Delete Schedules
 */
describe('SchedulesService - Update Schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Update Schedule - Happy Path', () => {
    it('should successfully update schedule details', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = {
        timeSlot: '14:00-15:00',
        isAvailable: false
      };

      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      };

      const updatedSchedule = {
        ...existingSchedule,
        time_slot: updates.timeSlot,
        is_available: updates.isAvailable
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.checkConflicts.mockResolvedValue(false);
      schedulesRepository.update.mockResolvedValue(updatedSchedule);

      // Act
      const result = await schedulesService.updateSchedule(scheduleId, updates);

      // Assert
      expect(result.time_slot).toBe(updates.timeSlot);
      expect(result.is_available).toBe(updates.isAvailable);
      expect(schedulesRepository.update).toHaveBeenCalledWith(scheduleId, updates);
    });

    it('should update schedule availability without checking conflicts', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = {
        isAvailable: false
      };

      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.update.mockResolvedValue({
        ...existingSchedule,
        is_available: false
      });

      // Act
      const result = await schedulesService.updateSchedule(scheduleId, updates);

      // Assert
      expect(result.is_available).toBe(false);
      expect(schedulesRepository.checkConflicts).not.toHaveBeenCalled();
    });
  });

  describe('Update Schedule - Error Handling', () => {
    it('should reject update of non-existent schedule', async () => {
      // Arrange
      const scheduleId = 'non-existent-123';
      const updates = { isAvailable: false };
      schedulesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(schedulesService.updateSchedule(scheduleId, updates))
        .rejects.toThrow('Schedule not found');
    });

    it('should reject update with invalid time slot format', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = { timeSlot: 'invalid-time' };

      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00'
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);

      // Act & Assert
      await expect(schedulesService.updateSchedule(scheduleId, updates))
        .rejects.toThrow('Invalid time slot format');
    });

    it('should reject update when conflicts exist', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const updates = { timeSlot: '14:00-15:00' };

      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00'
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.checkConflicts.mockResolvedValue(true);

      // Act & Assert
      await expect(schedulesService.updateSchedule(scheduleId, updates))
        .rejects.toThrow('Schedule conflicts with existing time slots');
    });
  });
});

describe('SchedulesService - Delete Schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Delete Schedule - Happy Path', () => {
    it('should successfully delete a schedule', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00'
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.softDelete.mockResolvedValue(true);

      // Act
      const result = await schedulesService.deleteSchedule(scheduleId);

      // Assert
      expect(result).toEqual({ success: true });
      expect(schedulesRepository.softDelete).toHaveBeenCalledWith(scheduleId);
    });
  });

  describe('Delete Schedule - Error Handling', () => {
    it('should reject deletion of non-existent schedule', async () => {
      // Arrange
      const scheduleId = 'non-existent-123';
      schedulesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(schedulesService.deleteSchedule(scheduleId))
        .rejects.toThrow('Schedule not found');
    });
  });
});

/**
 * User Story: US-022 - Mark Time Slots as Available/Unavailable
 */
describe('SchedulesService - Toggle Availability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Toggle Availability - Happy Path', () => {
    it('should mark schedule as unavailable', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.update.mockResolvedValue({
        ...existingSchedule,
        is_available: false
      });

      // Act
      const result = await schedulesService.updateSchedule(scheduleId, { 
        isAvailable: false 
      });

      // Assert
      expect(result.is_available).toBe(false);
    });

    it('should mark schedule as available', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const existingSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-123',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: false
      };

      schedulesRepository.findById.mockResolvedValue(existingSchedule);
      schedulesRepository.update.mockResolvedValue({
        ...existingSchedule,
        is_available: true
      });

      // Act
      const result = await schedulesService.updateSchedule(scheduleId, { 
        isAvailable: true 
      });

      // Assert
      expect(result.is_available).toBe(true);
    });
  });
});

describe('SchedulesService - Retrieve Schedules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Doctor Schedules', () => {
    it('should retrieve all schedules for a doctor', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const mockSchedules = [
        {
          schedule_id: 'schedule-1',
          doctor_id: doctorId,
          date: '2025-12-15',
          time_slot: '10:00-11:00',
          is_available: true
        },
        {
          schedule_id: 'schedule-2',
          doctor_id: doctorId,
          date: '2025-12-15',
          time_slot: '14:00-15:00',
          is_available: true
        }
      ];

      schedulesRepository.findAllByDoctor.mockResolvedValue(mockSchedules);

      // Act
      const result = await schedulesService.getDoctorSchedules(doctorId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(s => s.doctor_id === doctorId)).toBe(true);
      expect(schedulesRepository.findAllByDoctor).toHaveBeenCalledWith(doctorId, {});
    });

    it('should retrieve schedules with date filter', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const filters = { date: '2025-12-15' };
      const mockSchedules = [
        {
          schedule_id: 'schedule-1',
          doctor_id: doctorId,
          date: '2025-12-15',
          time_slot: '10:00-11:00',
          is_available: true
        }
      ];

      schedulesRepository.findAllByDoctor.mockResolvedValue(mockSchedules);

      // Act
      const result = await schedulesService.getDoctorSchedules(doctorId, filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-12-15');
      expect(schedulesRepository.findAllByDoctor).toHaveBeenCalledWith(doctorId, filters);
    });

    it('should return empty array when doctor has no schedules', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      schedulesRepository.findAllByDoctor.mockResolvedValue([]);

      // Act
      const result = await schedulesService.getDoctorSchedules(doctorId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Get Schedule by ID', () => {
    it('should retrieve schedule by ID', async () => {
      // Arrange
      const scheduleId = 'schedule-123';
      const mockSchedule = {
        schedule_id: scheduleId,
        doctor_id: 'doctor-456',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      };

      schedulesRepository.findById.mockResolvedValue(mockSchedule);

      // Act
      const result = await schedulesService.getScheduleById(scheduleId);

      // Assert
      expect(result).toEqual(mockSchedule);
      expect(result.schedule_id).toBe(scheduleId);
    });

    it('should throw error when schedule not found', async () => {
      // Arrange
      const scheduleId = 'non-existent-123';
      schedulesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(schedulesService.getScheduleById(scheduleId))
        .rejects.toThrow('Schedule not found');
    });
  });
});
