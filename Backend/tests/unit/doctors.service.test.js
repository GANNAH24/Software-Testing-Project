/**
 * Unit Tests for Doctors Service
 * 
 * User Stories Covered:
 * - US-006: As a Patient, I want to browse all available doctors without logging in
 * - US-007: As a Patient, I want to search doctors by name or specialty
 * - US-008: As a Patient, I want to filter doctors by specialty and location
 * - US-009: As a Patient, I want to view detailed doctor profiles
 * - US-010: As an Admin, I want to create, update, and delete doctor profiles
 */

const doctorsService = require('../../src/features/doctors/doctors.service');
const doctorsRepository = require('../../src/features/doctors/doctors.repository');

// Mock dependencies
jest.mock('../../src/features/doctors/doctors.repository');
jest.mock('../../src/shared/utils/logger.util', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('DoctorsService - Browse and Search Doctors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * User Story: US-006 - Browse All Doctors
   */
  describe('Get All Doctors - Happy Path', () => {
    it('should retrieve all doctors without filters', async () => {
      // Arrange
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York',
          years_experience: 10
        },
        {
          doctor_id: 'doctor-2',
          name: 'Dr. Jane Doe',
          specialty: 'Pediatrics',
          location: 'Los Angeles',
          years_experience: 8
        }
      ];

      doctorsRepository.findAll.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.getAllDoctors({});

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].specialty).toBe('Cardiology');
      expect(result[1].specialty).toBe('Pediatrics');
      expect(doctorsRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should return empty array when no doctors exist', async () => {
      // Arrange
      doctorsRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await doctorsService.getAllDoctors({});

      // Assert
      expect(result).toEqual([]);
    });
  });

  /**
   * User Story: US-007 - Search Doctors by Name or Specialty
   */
  describe('Search Doctors - Happy Path', () => {
    it('should search doctors by name', async () => {
      // Arrange
      const searchTerm = 'John';
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York'
        }
      ];

      doctorsRepository.findAll.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.searchDoctors(searchTerm);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('John');
      expect(doctorsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: searchTerm })
      );
    });

    it('should search doctors by specialty', async () => {
      // Arrange
      const searchTerm = 'Cardiology';
      const specialty = 'Cardiology';
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York'
        },
        {
          doctor_id: 'doctor-2',
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          location: 'Boston'
        }
      ];

      doctorsRepository.findAll.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.searchDoctors(searchTerm, specialty);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(doc => doc.specialty === 'Cardiology')).toBe(true);
    });

    it('should return empty array when no doctors match search', async () => {
      // Arrange
      const searchTerm = 'NonExistentDoctor';
      doctorsRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await doctorsService.searchDoctors(searchTerm);

      // Assert
      expect(result).toEqual([]);
    });
  });

  /**
   * User Story: US-008 - Filter Doctors by Specialty and Location
   */
  describe('Filter Doctors - Happy Path', () => {
    it('should filter doctors by specialty', async () => {
      // Arrange
      const specialty = 'Pediatrics';
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. Jane Doe',
          specialty: 'Pediatrics',
          location: 'Los Angeles'
        }
      ];

      doctorsRepository.findBySpecialty.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.getDoctorsBySpecialty(specialty);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].specialty).toBe('Pediatrics');
      expect(doctorsRepository.findBySpecialty).toHaveBeenCalledWith(specialty);
    });

    it('should filter doctors by location', async () => {
      // Arrange
      const location = 'New York';
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York'
        },
        {
          doctor_id: 'doctor-2',
          name: 'Dr. Mike Brown',
          specialty: 'Orthopedics',
          location: 'New York'
        }
      ];

      doctorsRepository.findByLocation.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.getDoctorsByLocation(location);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(doc => doc.location === 'New York')).toBe(true);
      expect(doctorsRepository.findByLocation).toHaveBeenCalledWith(location);
    });

    it('should perform advanced search with multiple filters', async () => {
      // Arrange
      const filters = {
        searchTerm: 'Smith',
        specialty: 'Cardiology',
        location: 'New York',
        minReviews: 10,
        sortBy: 'reviews'
      };
      const mockDoctors = [
        {
          doctor_id: 'doctor-1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York',
          reviews_count: 50
        }
      ];

      doctorsRepository.advancedSearch.mockResolvedValue(mockDoctors);

      // Act
      const result = await doctorsService.advancedSearchDoctors(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('Smith');
      expect(result[0].specialty).toBe('Cardiology');
      expect(result[0].location).toBe('New York');
      expect(result[0].reviews_count).toBeGreaterThanOrEqual(10);
    });
  });

  /**
   * User Story: US-009 - View Detailed Doctor Profile
   */
  describe('Get Doctor Profile - Happy Path', () => {
    it('should retrieve doctor by ID', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const mockDoctor = {
        doctor_id: doctorId,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        location: 'New York',
        qualifications: 'MD, FACC',
        years_experience: 15,
        bio: 'Experienced cardiologist'
      };

      doctorsRepository.findById.mockResolvedValue(mockDoctor);

      // Act
      const result = await doctorsService.getDoctorById(doctorId);

      // Assert
      expect(result).toEqual(mockDoctor);
      expect(result.doctor_id).toBe(doctorId);
      expect(doctorsRepository.findById).toHaveBeenCalledWith(doctorId);
    });

    it('should retrieve detailed doctor profile with reviews', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const mockDetailedProfile = {
        doctor_id: doctorId,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        qualifications: 'MD, FACC',
        reviews_count: 50,
        average_rating: 4.8,
        reviews: [
          { rating: 5, comment: 'Excellent doctor' },
          { rating: 4, comment: 'Very professional' }
        ]
      };

      doctorsRepository.getDetailedProfile.mockResolvedValue(mockDetailedProfile);

      // Act
      const result = await doctorsService.getDetailedDoctorProfile(doctorId);

      // Assert
      expect(result).toHaveProperty('reviews');
      expect(result.reviews_count).toBe(50);
      expect(result.average_rating).toBe(4.8);
    });

    it('should retrieve doctor by user ID', async () => {
      // Arrange
      const userId = 'user-456';
      const mockDoctor = {
        doctor_id: 'doctor-123',
        user_id: userId,
        name: 'Dr. Jane Doe',
        specialty: 'Pediatrics'
      };

      doctorsRepository.findByUserId.mockResolvedValue(mockDoctor);

      // Act
      const result = await doctorsService.getDoctorByUserId(userId);

      // Assert
      expect(result.user_id).toBe(userId);
      expect(doctorsRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Get Doctor Profile - Error Handling', () => {
    it('should throw error when doctor not found by ID', async () => {
      // Arrange
      const doctorId = 'non-existent-123';
      doctorsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(doctorsService.getDoctorById(doctorId))
        .rejects.toThrow('Doctor not found');
    });

    it('should throw error when doctor not found by user ID', async () => {
      // Arrange
      const userId = 'non-existent-456';
      doctorsRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(doctorsService.getDoctorByUserId(userId))
        .rejects.toThrow('Doctor profile not found');
    });

    it('should throw error when detailed profile not found', async () => {
      // Arrange
      const doctorId = 'non-existent-123';
      doctorsRepository.getDetailedProfile.mockResolvedValue(null);

      // Act & Assert
      await expect(doctorsService.getDetailedDoctorProfile(doctorId))
        .rejects.toThrow('Doctor not found');
    });
  });
});

/**
 * User Story: US-010 - Admin Manage Doctor Profiles
 */
describe('DoctorsService - Admin Doctor Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Doctor - Happy Path', () => {
    it('should successfully create a new doctor profile', async () => {
      // Arrange
      const mockDoctorData = {
        user_id: 'user-789',
        name: 'Dr. New Doctor',
        specialty: 'Neurology',
        qualifications: 'MD, PhD',
        location: 'Chicago',
        years_experience: 5,
        bio: 'Neurologist specializing in brain disorders'
      };

      const mockCreatedDoctor = {
        doctor_id: 'doctor-new-123',
        ...mockDoctorData,
        created_at: new Date().toISOString()
      };

      doctorsRepository.create.mockResolvedValue(mockCreatedDoctor);

      // Act
      const result = await doctorsService.createDoctor(mockDoctorData);

      // Assert
      expect(result).toHaveProperty('doctor_id');
      expect(result.name).toBe(mockDoctorData.name);
      expect(result.specialty).toBe(mockDoctorData.specialty);
      expect(doctorsRepository.create).toHaveBeenCalledWith(mockDoctorData);
    });
  });

  describe('Update Doctor - Happy Path', () => {
    it('should successfully update doctor profile', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const updates = {
        location: 'Boston',
        years_experience: 16,
        bio: 'Updated bio'
      };

      const existingDoctor = {
        doctor_id: doctorId,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        location: 'New York',
        years_experience: 15
      };

      const updatedDoctor = {
        ...existingDoctor,
        ...updates
      };

      doctorsRepository.findById.mockResolvedValue(existingDoctor);
      doctorsRepository.update.mockResolvedValue(updatedDoctor);

      // Act
      const result = await doctorsService.updateDoctor(doctorId, updates);

      // Assert
      expect(result.location).toBe('Boston');
      expect(result.years_experience).toBe(16);
      expect(doctorsRepository.update).toHaveBeenCalledWith(doctorId, updates);
    });
  });

  describe('Update Doctor - Error Handling', () => {
    it('should throw error when updating non-existent doctor', async () => {
      // Arrange
      const doctorId = 'non-existent-123';
      const updates = { location: 'Boston' };
      doctorsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(doctorsService.updateDoctor(doctorId, updates))
        .rejects.toThrow('Doctor not found');
    });
  });

  describe('Delete Doctor - Happy Path', () => {
    it('should successfully soft delete a doctor profile', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const existingDoctor = {
        doctor_id: doctorId,
        name: 'Dr. John Smith',
        specialty: 'Cardiology'
      };

      doctorsRepository.findById.mockResolvedValue(existingDoctor);
      doctorsRepository.softDelete.mockResolvedValue(true);

      // Act
      const result = await doctorsService.deleteDoctor(doctorId);

      // Assert
      expect(result).toEqual({ success: true });
      expect(doctorsRepository.softDelete).toHaveBeenCalledWith(doctorId);
    });
  });

  describe('Delete Doctor - Error Handling', () => {
    it('should throw error when deleting non-existent doctor', async () => {
      // Arrange
      const doctorId = 'non-existent-123';
      doctorsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(doctorsService.deleteDoctor(doctorId))
        .rejects.toThrow('Doctor not found');
    });
  });
});

/**
 * Advanced Search Tests
 */
describe('DoctorsService - Advanced Search Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Advanced Search with Filters', () => {
    it('should sanitize and validate search filters', async () => {
      // Arrange
      const filters = {
        searchTerm: '  cardio  ',
        specialty: '  Cardiology  ',
        location: '  New York  ',
        minReviews: '10',
        sortBy: 'reviews'
      };

      doctorsRepository.advancedSearch.mockResolvedValue([]);

      // Act
      await doctorsService.advancedSearchDoctors(filters);

      // Assert
      expect(doctorsRepository.advancedSearch).toHaveBeenCalledWith({
        searchTerm: 'cardio',
        specialty: 'Cardiology',
        location: 'New York',
        minReviews: 10,
        sortBy: 'reviews'
      });
    });

    it('should handle empty filters gracefully', async () => {
      // Arrange
      const filters = {};
      doctorsRepository.advancedSearch.mockResolvedValue([]);

      // Act
      await doctorsService.advancedSearchDoctors(filters);

      // Assert
      expect(doctorsRepository.advancedSearch).toHaveBeenCalledWith({
        searchTerm: null,
        specialty: null,
        location: null,
        minReviews: null,
        sortBy: 'reviews'
      });
    });

    it('should handle invalid minReviews value', async () => {
      // Arrange
      const filters = {
        minReviews: 'invalid'
      };
      doctorsRepository.advancedSearch.mockResolvedValue([]);

      // Act
      await doctorsService.advancedSearchDoctors(filters);

      // Assert
      expect(doctorsRepository.advancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          minReviews: NaN
        })
      );
    });
  });
});
