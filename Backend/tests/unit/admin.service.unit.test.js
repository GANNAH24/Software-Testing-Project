/**
 * Unit Tests for Admin Service (Mocked)
 */

jest.mock('../../src/features/admin/admin.repository');

const adminService = require('../../src/features/admin/admin.service');
const adminRepository = require('../../src/features/admin/admin.repository');

describe('Admin Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPatients()', () => {
    it('should retrieve all patients', async () => {
      const mockPatients = [{ patient_id: 'p1', full_name: 'Test' }];
      adminRepository.getAllPatients.mockResolvedValue(mockPatients);

      const result = await adminService.getAllPatients();

      expect(result).toEqual(mockPatients);
    });
  });

  describe('getAllDoctors()', () => {
    it('should retrieve all doctors', async () => {
      const mockDoctors = [{ doctor_id: 'd1', name: 'Dr. Test' }];
      adminRepository.getAllDoctors.mockResolvedValue(mockDoctors);

      const result = await adminService.getAllDoctors();

      expect(result).toEqual(mockDoctors);
    });
  });

  describe('getSystemStats()', () => {
    it('should return system statistics', async () => {
      const mockStats = { totalPatients: 10, totalDoctors: 5, totalAppointments: 20 };
      adminRepository.getSystemStats.mockResolvedValue(mockStats);

      const result = await adminService.getSystemStats();

      expect(result).toEqual(mockStats);
    });
  });
});
