/**
 * Unit Tests for Doctors Service (Mocked)
 */

jest.mock('../../src/features/doctors/doctors.repository');

const doctorsService = require('../../src/features/doctors/doctors.service');
const doctorsRepository = require('../../src/features/doctors/doctors.repository');

describe('Doctors Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDoctors()', () => {
    it('should retrieve all doctors with filters', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', first_name: 'John', specialty: 'Cardiology' },
        { doctor_id: 'd2', first_name: 'Jane', specialty: 'Neurology' }
      ];

      doctorsRepository.findAll.mockResolvedValue(mockDoctors);

      const result = await doctorsService.getAllDoctors({ status: 'active' });

      expect(result).toEqual(mockDoctors);
      expect(doctorsRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getDoctorById()', () => {
    it('should retrieve doctor by ID', async () => {
      const mockDoctor = {
        doctor_id: 'd1',
        first_name: 'John',
        specialty: 'Cardiology'
      };

      doctorsRepository.findById.mockResolvedValue(mockDoctor);

      const result = await doctorsService.getDoctorById('d1');

      expect(result).toEqual(mockDoctor);
      expect(doctorsRepository.findById).toHaveBeenCalledWith('d1');
    });
  });

  describe('getDoctorByUserId()', () => {
    it('should retrieve doctor by user ID', async () => {
      const mockDoctor = {
        doctor_id: 'd1',
        user_id: 'u1',
        first_name: 'John'
      };

      doctorsRepository.findByUserId.mockResolvedValue(mockDoctor);

      const result = await doctorsService.getDoctorByUserId('u1');

      expect(result).toEqual(mockDoctor);
      expect(doctorsRepository.findByUserId).toHaveBeenCalledWith('u1');
    });
  });

  describe('advancedSearchDoctors()', () => {
    it('should search doctors with advanced filters', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', specialty: 'Cardiology', location: 'New York' }
      ];

      doctorsRepository.advancedSearch.mockResolvedValue(mockDoctors);

      const filters = { specialty: 'Cardiology', location: 'New York' };
      const result = await doctorsService.advancedSearchDoctors(filters);

      expect(result).toEqual(mockDoctors);
      expect(doctorsRepository.advancedSearch).toHaveBeenCalledWith(expect.objectContaining({
        specialty: 'Cardiology',
        location: 'New York'
      }));
    });
  });

  describe('searchDoctors()', () => {
    it('should search doctors by keyword', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', first_name: 'John' }
      ];

      doctorsRepository.advancedSearch.mockResolvedValue(mockDoctors);

      const result = await doctorsService.searchDoctors('John');

      expect(result).toEqual(mockDoctors);
      expect(doctorsRepository.advancedSearch).toHaveBeenCalled();
    });
  });

  describe('getDoctorsBySpecialty()', () => {
    it('should retrieve doctors by specialty', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', specialty: 'Cardiology' }
      ];

      doctorsRepository.findBySpecialty.mockResolvedValue(mockDoctors);

      const result = await doctorsService.getDoctorsBySpecialty('Cardiology');

      expect(result).toEqual(mockDoctors);
      expect(doctorsRepository.findBySpecialty).toHaveBeenCalledWith('Cardiology');
    });
  });

  describe('getDoctorsByLocation()', () => {
    it('should retrieve doctors by location', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', location: 'New York' }
      ];

      doctorsRepository.findByLocation.mockResolvedValue(mockDoctors);

      const result = await doctorsService.getDoctorsByLocation('New York');

      expect(result).toEqual(mockDoctors);
      expect(doctorsRepository.findByLocation).toHaveBeenCalledWith('New York');
    });
  });

  describe('getDetailedDoctorProfile()', () => {
    it('should retrieve detailed doctor profile', async () => {
      const mockDoctor = {
        doctor_id: 'd1',
        first_name: 'John',
        specialty: 'Cardiology',
        bio: 'Experienced cardiologist',
        qualifications: ['MD', 'Board Certified']
      };

      doctorsRepository.getDetailedProfile.mockResolvedValue(mockDoctor);

      const result = await doctorsService.getDetailedDoctorProfile('d1');

      expect(result).toEqual(mockDoctor);
      expect(doctorsRepository.getDetailedProfile).toHaveBeenCalledWith('d1');
    });
  });

  describe('updateDoctor()', () => {
    it('should update doctor information', async () => {
      const updates = { bio: 'Updated bio' };
      const mockExisting = { doctor_id: 'd1', first_name: 'John' };
      const mockUpdated = { ...mockExisting, ...updates };

      doctorsRepository.findById.mockResolvedValueOnce(mockExisting);
      doctorsRepository.update.mockResolvedValueOnce(mockUpdated);

      const result = await doctorsService.updateDoctor('d1', updates);

      expect(result).toEqual(mockUpdated);
      expect(doctorsRepository.update).toHaveBeenCalledWith('d1', expect.any(Object));
    });
  });

  describe('createDoctor()', () => {
    it('should create new doctor with valid data', async () => {
      const doctorData = {
        user_id: 'u1',
        first_name: 'John',
        last_name: 'Doe',
        specialty: 'Cardiology'
      };
      const mockCreated = { doctor_id: 'd1', ...doctorData };

      doctorsRepository.create.mockResolvedValue(mockCreated);

      const result = await doctorsService.createDoctor(doctorData);

      expect(result).toEqual(mockCreated);
      expect(doctorsRepository.create).toHaveBeenCalled();
    });
  });

  describe('deleteDoctor()', () => {
    it('should delete doctor', async () => {
      const mockExisting = { doctor_id: 'd1', first_name: 'John' };
      
      doctorsRepository.findById.mockResolvedValueOnce(mockExisting);
      doctorsRepository.softDelete.mockResolvedValue({ success: true });

      const result = await doctorsService.deleteDoctor('d1');

      expect(result.success).toBe(true);
      expect(doctorsRepository.softDelete).toHaveBeenCalledWith('d1');
    });
  });
});
