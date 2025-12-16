/**
 * Unit Tests for Appointments Service (Mocked)
 */

jest.mock('../../src/features/appointments/appointments.repository');
jest.mock('../../src/features/doctors/doctors.repository');
jest.mock('../../src/features/schedules/schedules.repository');

const appointmentsService = require('../../src/features/appointments/appointments.service');
const appointmentsRepository = require('../../src/features/appointments/appointments.repository');
const doctorsRepository = require('../../src/features/doctors/doctors.repository');
const schedulesRepository = require('../../src/features/schedules/schedules.repository');

describe('Appointments Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock common dependencies
    doctorsRepository.findById.mockResolvedValue({
      doctor_id: 'd1',
      specialty: 'Cardiology',
      working_hours_start: '09:00:00',
      working_hours_end: '17:00:00'
    });
    schedulesRepository.checkConflicts.mockResolvedValue(false);
    schedulesRepository.getDailySchedule.mockResolvedValue([]);
  });

  describe('getAppointments()', () => {
    it('should retrieve appointments with filters', async () => {
      const mockAppointments = [
        { appointment_id: 'a1', patient_id: 'p1', status: 'booked' },
        { appointment_id: 'a2', patient_id: 'p1', status: 'booked' }
      ];

      appointmentsRepository.findAll.mockResolvedValue(mockAppointments);

      const result = await appointmentsService.getAppointments({ status: 'booked' });

      expect(result).toEqual(mockAppointments);
    });
  });

  describe('getPatientAppointments()', () => {
    it('should retrieve patient appointments', async () => {
      const mockAppointments = [
        { appointment_id: 'a1', patient_id: 'p1', date: '2025-12-20' }
      ];

      appointmentsRepository.findByPatientId.mockResolvedValue(mockAppointments);

      const result = await appointmentsService.getPatientAppointments('p1');

      expect(result).toEqual(mockAppointments);
    });
  });

  describe('getDoctorAppointments()', () => {
    it('should retrieve doctor appointments', async () => {
      const mockAppointments = [
        { appointment_id: 'a1', doctor_id: 'd1', date: '2025-12-20' }
      ];

      appointmentsRepository.findByDoctorId.mockResolvedValue(mockAppointments);

      const result = await appointmentsService.getDoctorAppointments('d1');

      expect(result).toEqual(mockAppointments);
    });
  });

  describe('getAppointmentById()', () => {
    it('should retrieve appointment by ID', async () => {
      const mockAppt = {
        appointment_id: 'a1',
        patient_id: 'p1',
        doctor_id: 'd1',
        status: 'booked'
      };

      appointmentsRepository.findById.mockResolvedValue(mockAppt);

      const result = await appointmentsService.getAppointmentById('a1');

      expect(result).toEqual(mockAppt);
    });
  });

  describe('cancelAppointment()', () => {
    it('should cancel appointment', async () => {
      const mockCanceled = { appointment_id: 'a1', status: 'cancelled' };

      appointmentsRepository.cancel.mockResolvedValue(mockCanceled);

      const result = await appointmentsService.cancelAppointment('a1', 'Patient request');

      expect(result.status).toBe('cancelled');
    });
  });

  describe('updateAppointment()', () => {
    it('should update appointment', async () => {
      const updates = { notes: 'Updated notes' };
      const mockUpdated = { appointment_id: 'a1', ...updates };

      appointmentsRepository.update.mockResolvedValue(mockUpdated);

      const result = await appointmentsService.updateAppointment('a1', updates);

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('completeAppointment()', () => {
    it('should mark appointment as completed', async () => {
      const mockCompleted = { appointment_id: 'a1', status: 'completed', notes: 'Checkup completed' };

      appointmentsRepository.update.mockResolvedValue(mockCompleted);

      const result = await appointmentsService.completeAppointment('a1', 'Checkup completed');

      expect(result.status).toBe('completed');
    });
  });
});
