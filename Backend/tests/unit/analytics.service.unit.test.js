/**
 * Unit Tests for Analytics Service (Mocked)
 */

jest.mock('../../src/features/admin/analytics.repository');

const analyticsService = require('../../src/features/admin/analytics.service');
const analyticsRepository = require('../../src/features/admin/analytics.repository');

describe('Analytics Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpecialtyDistribution()', () => {
    it('should get specialty distribution', async () => {
      const mockDistribution = [
        { specialty: 'Cardiology', value: 5 },
        { specialty: 'Neurology', value: 3 }
      ];
      analyticsRepository.getDoctorsBySpecialty.mockResolvedValue(mockDistribution);

      const result = await analyticsService.getSpecialtyDistribution();

      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTopPerformingDoctors()', () => {
    it('should get top performing doctors', async () => {
      const mockDoctors = [
        { doctor_id: 'd1', name: 'Dr. Smith', appointmentCount: 50 },
        { doctor_id: 'd2', name: 'Dr. Jones', appointmentCount: 40 }
      ];
      analyticsRepository.getTopDoctors.mockResolvedValue(mockDoctors);

      const result = await analyticsService.getTopPerformingDoctors(10);

      expect(result).toEqual(mockDoctors);
    });
  });

  // Note: getAnalyticsOverview() uses direct Supabase queries for counts,
  // so it's better tested in integration tests
});
