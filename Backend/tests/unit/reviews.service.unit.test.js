/**
 * Unit Tests for Reviews Service (Mocked)
 */

jest.mock('../../src/features/reviews/reviews.repository');

const reviewsService = require('../../src/features/reviews/reviews.service');
const reviewsRepository = require('../../src/features/reviews/reviews.repository');

describe('Reviews Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview()', () => {
    it('should create a review successfully', async () => {
      // Arrange
      const reviewData = {
        appointmentId: 123,
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
        comment: 'Excellent!'
      };

      reviewsRepository.canReview.mockResolvedValue({
        canReview: true
      });

      const mockReview = {
        review_id: 'review-1',
        ...reviewData,
        created_at: new Date().toISOString()
      };

      reviewsRepository.createReview.mockResolvedValue(mockReview);

      // Act
      const result = await reviewsService.createReview(reviewData);

      // Assert
      expect(result).toEqual(mockReview);
      expect(reviewsRepository.canReview).toHaveBeenCalledWith(123, 'patient-1');
      expect(reviewsRepository.createReview).toHaveBeenCalledWith(reviewData);
    });

    it('should reject invalid rating (out of range)', async () => {
      // Arrange
      const reviewData = {
        appointmentId: 123,
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 6, // Invalid
        comment: 'Invalid'
      };

      // Act & Assert
      await expect(reviewsService.createReview(reviewData))
        .rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should reject review if patient cannot review', async () => {
      // Arrange
      const reviewData = {
        appointmentId: 123,
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
        comment: 'Good'
      };

      reviewsRepository.canReview.mockResolvedValue({
        canReview: false,
        reason: 'Appointment not completed'
      });

      // Act & Assert
      await expect(reviewsService.createReview(reviewData))
        .rejects.toThrow('Appointment not completed');
    });
  });

  describe('getDoctorReviews()', () => {
    it('should retrieve doctor reviews with average rating', async () => {
      // Arrange
      const mockReviews = [
        { review_id: '1', rating: 5, comment: 'Great!' },
        { review_id: '2', rating: 4, comment: 'Good' }
      ];

      reviewsRepository.getDoctorReviews.mockResolvedValue(mockReviews);
      reviewsRepository.getDoctorAverageRating.mockResolvedValue({
        averageRating: 4.5,
        reviewCount: 2
      });

      // Act
      const result = await reviewsService.getDoctorReviews('doctor-1');

      // Assert
      expect(result.reviews).toEqual(mockReviews);
      expect(result.averageRating).toBe(4.5);
      expect(result.reviewCount).toBe(2);
    });
  });
});
