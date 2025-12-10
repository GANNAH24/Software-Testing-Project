/**
 * Unit Tests for Appointments Service
 * 
 * User Stories Covered:
 * - US-011: As a Patient, I want to book an appointment with a doctor for a specific date and time
 * - US-012: As a Patient, I want to view my upcoming appointments
 * - US-013: As a Patient, I want to view my past appointments
 * - US-014: As a Patient, I want to cancel an upcoming appointment
 * - US-015: As a Patient, I want to be prevented from booking appointments on unavailable time slots
 * - US-016: As a Doctor, I want to view all my appointments (upcoming and past)
 * - US-017: As a Doctor, I want to filter appointments by status and date
 */

const appointmentsService = require('../../src/features/appointments/appointments.service');
const appointmentsRepository = require('../../src/features/appointments/appointments.repository');
const { supabase } = require('../../src/config/database');

// Mock dependencies
jest.mock('../../src/features/appointments/appointments.repository');
jest.mock('../../src/config/database', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }))
  }
}));
jest.mock('../../src/shared/utils/logger.util', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('AppointmentsService - Appointment Booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * User Story: US-011 - Book Appointment
   */
  describe('Create Appointment - Happy Path', () => {
    it('should successfully create an appointment with valid data', async () => {
      // Arrange
      const mockAppointmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: '2025-12-15',
        timeSlot: '10:00-11:00',
        notes: 'Regular checkup'
      };

      const mockSchedule = [{
        schedule_id: 'schedule-789',
        doctor_id: 'doctor-456',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        is_available: true
      }];

      supabase.from.mockImplementation((table) => {
        if (table === 'doctor_schedules') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            then: jest.fn().mockResolvedValue({
              data: mockSchedule,
              error: null
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
      });

      appointmentsRepository.create.mockResolvedValue({
        appointment_id: 'appointment-123',
        patient_id: 'patient-123',
        doctor_id: 'doctor-456',
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        status: 'booked',
        notes: 'Regular checkup'
      });

      // Act
      const result = await appointmentsService.createAppointment(mockAppointmentData);

      // Assert
      expect(result).toHaveProperty('appointment_id');
      expect(result.patient_id).toBe(mockAppointmentData.patientId);
      expect(result.doctor_id).toBe(mockAppointmentData.doctorId);
      expect(result.status).toBe('booked');
    });
  });

  /**
   * Error Handling Tests
   * User Story: US-015 - Prevent booking on unavailable slots
   */
  describe('Create Appointment - Availability Validation', () => {
    it('should reject appointment when time slot is not available', async () => {
      // Arrange
      const mockAppointmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: '2025-12-15',
        timeSlot: '10:00-11:00'
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'doctor_schedules') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            then: jest.fn().mockResolvedValue({
              data: [], // No available schedules
              error: null
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
      });

      // Act & Assert
      await expect(appointmentsService.createAppointment(mockAppointmentData))
        .rejects.toThrow('No available time slot found');
    });

    it('should reject appointment for past dates', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const mockAppointmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: pastDate.toISOString().split('T')[0],
        timeSlot: '10:00-11:00'
      };

      // Act & Assert
      await expect(appointmentsService.createAppointment(mockAppointmentData))
        .rejects.toThrow('Appointment date must be in the future');
    });

    it('should reject appointment with invalid date format', async () => {
      // Arrange
      const mockAppointmentData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: 'invalid-date',
        timeSlot: '10:00-11:00'
      };

      // Act & Assert
      await expect(appointmentsService.createAppointment(mockAppointmentData))
        .rejects.toThrow('Invalid date format');
    });
  });

  /**
   * Edge Cases - Required Fields
   */
  describe('Create Appointment - Required Fields Validation', () => {
    it('should reject appointment without patient ID', async () => {
      // Arrange
      const mockAppointmentData = {
        doctorId: 'doctor-456',
        date: '2025-12-15',
        timeSlot: '10:00-11:00'
      };

      // Act & Assert
      await expect(appointmentsService.createAppointment(mockAppointmentData))
        .rejects.toThrow();
    });

    it('should reject appointment without doctor ID', async () => {
      // Arrange
      const mockAppointmentData = {
        patientId: 'patient-123',
        date: '2025-12-15',
        timeSlot: '10:00-11:00'
      };

      // Act & Assert
      await expect(appointmentsService.createAppointment(mockAppointmentData))
        .rejects.toThrow();
    });
  });
});

/**
 * User Story: US-012 - View Upcoming Appointments
 * User Story: US-013 - View Past Appointments
 */
describe('AppointmentsService - Retrieve Appointments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Patient Appointments - Happy Path', () => {
    it('should retrieve all appointments for a patient', async () => {
      // Arrange
      const patientId = 'patient-123';
      const mockAppointments = [
        {
          appointment_id: 'apt-1',
          patient_id: patientId,
          doctor_id: 'doctor-456',
          date: '2025-12-15',
          time_slot: '10:00-11:00',
          status: 'booked'
        },
        {
          appointment_id: 'apt-2',
          patient_id: patientId,
          doctor_id: 'doctor-789',
          date: '2025-12-20',
          time_slot: '14:00-15:00',
          status: 'booked'
        }
      ];

      appointmentsRepository.findByPatientId.mockResolvedValue(mockAppointments);

      // Act
      const result = await appointmentsService.getPatientAppointments(patientId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].patient_id).toBe(patientId);
      expect(appointmentsRepository.findByPatientId).toHaveBeenCalledWith(patientId);
    });

    it('should return empty array when patient has no appointments', async () => {
      // Arrange
      const patientId = 'patient-123';
      appointmentsRepository.findByPatientId.mockResolvedValue([]);

      // Act
      const result = await appointmentsService.getPatientAppointments(patientId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  /**
   * User Story: US-016 - Doctor View Appointments
   */
  describe('Get Doctor Appointments - Happy Path', () => {
    it('should retrieve all appointments for a doctor', async () => {
      // Arrange
      const doctorId = 'doctor-456';
      const mockAppointments = [
        {
          appointment_id: 'apt-1',
          patient_id: 'patient-123',
          doctor_id: doctorId,
          date: '2025-12-15',
          time_slot: '10:00-11:00',
          status: 'booked'
        }
      ];

      appointmentsRepository.findByDoctorId.mockResolvedValue(mockAppointments);

      // Act
      const result = await appointmentsService.getDoctorAppointments(doctorId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].doctor_id).toBe(doctorId);
      expect(appointmentsRepository.findByDoctorId).toHaveBeenCalledWith(doctorId);
    });
  });

  describe('Get Upcoming Appointments', () => {
    it('should retrieve upcoming appointments for a patient', async () => {
      // Arrange
      const userId = 'patient-123';
      const role = 'patient';
      const mockUpcomingAppointments = [
        {
          appointment_id: 'apt-1',
          patient_id: userId,
          date: '2025-12-20',
          time_slot: '10:00-11:00',
          status: 'booked'
        }
      ];

      appointmentsRepository.findUpcoming.mockResolvedValue(mockUpcomingAppointments);

      // Act
      const result = await appointmentsService.getUpcomingAppointments(userId, role);

      // Assert
      expect(result).toHaveLength(1);
      expect(new Date(result[0].date)).toBeInstanceOf(Date);
      expect(appointmentsRepository.findUpcoming).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('Get Past Appointments', () => {
    it('should retrieve past appointments for a patient', async () => {
      // Arrange
      const userId = 'patient-123';
      const role = 'patient';
      const mockPastAppointments = [
        {
          appointment_id: 'apt-1',
          patient_id: userId,
          date: '2025-11-01',
          time_slot: '10:00-11:00',
          status: 'completed'
        }
      ];

      appointmentsRepository.findPast.mockResolvedValue(mockPastAppointments);

      // Act
      const result = await appointmentsService.getPastAppointments(userId, role);

      // Assert
      expect(result).toHaveLength(1);
      expect(appointmentsRepository.findPast).toHaveBeenCalledWith(userId, role);
    });
  });
});

/**
 * User Story: US-014 - Cancel Appointment
 */
describe('AppointmentsService - Cancel Appointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cancel Appointment - Happy Path', () => {
    it('should successfully cancel a future appointment', async () => {
      // Arrange
      const appointmentId = 'appointment-123';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const mockAppointment = {
        appointment_id: appointmentId,
        patient_id: 'patient-123',
        doctor_id: 'doctor-456',
        date: futureDate.toISOString().split('T')[0],
        time_slot: '10:00-11:00',
        status: 'booked'
      };

      appointmentsRepository.findById.mockResolvedValue(mockAppointment);
      appointmentsRepository.update.mockResolvedValue({
        ...mockAppointment,
        status: 'cancelled'
      });

      // Act
      const result = await appointmentsService.cancelAppointment(appointmentId);

      // Assert
      expect(result.status).toBe('cancelled');
      expect(appointmentsRepository.update).toHaveBeenCalledWith(
        appointmentId,
        expect.objectContaining({ status: 'cancelled' })
      );
    });
  });

  describe('Cancel Appointment - Error Handling', () => {
    it('should reject cancellation of non-existent appointment', async () => {
      // Arrange
      const appointmentId = 'non-existent-123';
      appointmentsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(appointmentsService.cancelAppointment(appointmentId))
        .rejects.toThrow('Appointment not found');
    });

    it('should reject cancellation of past appointment', async () => {
      // Arrange
      const appointmentId = 'appointment-123';
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const mockAppointment = {
        appointment_id: appointmentId,
        date: pastDate.toISOString().split('T')[0],
        time_slot: '10:00-11:00',
        status: 'booked'
      };

      appointmentsRepository.findById.mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(appointmentsService.cancelAppointment(appointmentId))
        .rejects.toThrow('Cannot cancel past appointment');
    });

    it('should reject cancellation of already cancelled appointment', async () => {
      // Arrange
      const appointmentId = 'appointment-123';
      const mockAppointment = {
        appointment_id: appointmentId,
        date: '2025-12-15',
        time_slot: '10:00-11:00',
        status: 'cancelled'
      };

      appointmentsRepository.findById.mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(appointmentsService.cancelAppointment(appointmentId))
        .rejects.toThrow('Appointment is already cancelled');
    });
  });
});

/**
 * User Story: US-017 - Filter Appointments by Status and Date
 */
describe('AppointmentsService - Filter Appointments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Appointments with Filters', () => {
    it('should retrieve appointments filtered by status', async () => {
      // Arrange
      const filters = { status: 'booked' };
      const mockAppointments = [
        {
          appointment_id: 'apt-1',
          status: 'booked',
          date: '2025-12-15'
        },
        {
          appointment_id: 'apt-2',
          status: 'booked',
          date: '2025-12-16'
        }
      ];

      appointmentsRepository.findAll.mockResolvedValue(mockAppointments);

      // Act
      const result = await appointmentsService.getAppointments(filters);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(apt => apt.status === 'booked')).toBe(true);
      expect(appointmentsRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should retrieve appointments filtered by date', async () => {
      // Arrange
      const filters = { date: '2025-12-15' };
      const mockAppointments = [
        {
          appointment_id: 'apt-1',
          date: '2025-12-15',
          status: 'booked'
        }
      ];

      appointmentsRepository.findAll.mockResolvedValue(mockAppointments);

      // Act
      const result = await appointmentsService.getAppointments(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-12-15');
    });

    it('should retrieve appointments with multiple filters', async () => {
      // Arrange
      const filters = { 
        status: 'booked',
        doctorId: 'doctor-456',
        date: '2025-12-15'
      };
      const mockAppointments = [
        {
          appointment_id: 'apt-1',
          doctor_id: 'doctor-456',
          date: '2025-12-15',
          status: 'booked'
        }
      ];

      appointmentsRepository.findAll.mockResolvedValue(mockAppointments);

      // Act
      const result = await appointmentsService.getAppointments(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].doctor_id).toBe('doctor-456');
      expect(result[0].status).toBe('booked');
      expect(result[0].date).toBe('2025-12-15');
    });
  });
});
