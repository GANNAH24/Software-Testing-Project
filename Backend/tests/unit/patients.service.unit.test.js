/**
 * Unit Tests for Patients Service (Mocked)
 */

jest.mock('../../src/features/patients/patients.repository');

const PatientsService = require('../../src/features/patients/patients.service');
const PatientsRepository = require('../../src/features/patients/patients.repository');

describe('Patients Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAll()', () => {
    it('should retrieve all patients', async () => {
      const mockPatients = [
        { patient_id: 'p1', first_name: 'Alice', email: 'alice@test.com' },
        { patient_id: 'p2', first_name: 'Bob', email: 'bob@test.com' }
      ];

      PatientsRepository.getAllPatients.mockResolvedValue(mockPatients);

      const result = await PatientsService.listAll();

      expect(result).toEqual(mockPatients);
      expect(PatientsRepository.getAllPatients).toHaveBeenCalled();
    });
  });

  describe('getById()', () => {
    it('should retrieve patient by ID', async () => {
      const mockPatient = {
        patient_id: 'p1',
        first_name: 'Alice',
        email: 'alice@test.com',
        phone: '123-456-7890'
      };

      PatientsRepository.getPatientById.mockResolvedValue(mockPatient);

      const result = await PatientsService.getById('p1');

      expect(result).toEqual(mockPatient);
      expect(PatientsRepository.getPatientById).toHaveBeenCalledWith('p1');
    });
  });

  describe('getByUserId()', () => {
    it('should retrieve patient by user ID', async () => {
      const mockPatient = {
        patient_id: 'p1',
        user_id: 'u1',
        first_name: 'Alice'
      };

      PatientsRepository.getPatientByUserId.mockResolvedValue(mockPatient);

      const result = await PatientsService.getByUserId('u1');

      expect(result).toEqual(mockPatient);
      expect(PatientsRepository.getPatientByUserId).toHaveBeenCalledWith('u1');
    });

    it('should throw error when patient not found', async () => {
      PatientsRepository.getPatientByUserId.mockResolvedValue(null);

      await expect(PatientsService.getByUserId('u1')).rejects.toThrow('Patient not found');
    });
  });

  describe('update()', () => {
    it('should update patient information', async () => {
      const updates = { phone: '987-654-3210' };
      const mockUpdated = { patient_id: 'p1', first_name: 'Alice', ...updates };

      PatientsRepository.updatePatient.mockResolvedValue(mockUpdated);

      const result = await PatientsService.update('p1', updates);

      expect(result).toEqual(mockUpdated);
      expect(PatientsRepository.updatePatient).toHaveBeenCalledWith('p1', updates);
    });
  });

  describe('create()', () => {
    it('should create new patient', async () => {
      const patientData = {
        user_id: 'u1',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@test.com'
      };
      const mockCreated = { patient_id: 'p1', ...patientData };

      PatientsRepository.createPatient.mockResolvedValue(mockCreated);

      const result = await PatientsService.create(patientData);

      expect(result).toEqual(mockCreated);
      expect(PatientsRepository.createPatient).toHaveBeenCalledWith(patientData);
    });
  });
});
