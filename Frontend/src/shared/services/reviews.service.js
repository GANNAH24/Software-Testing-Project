import apiClient from './api.service';

const reviewsService = {
    // Get all reviews for a doctor
    getDoctorReviews: async (doctorId) => apiClient.get(`/reviews/doctor/${doctorId}`),

    // Check if patient can review an appointment
    canReview: async (appointmentId) => apiClient.get(`/reviews/can-review/${appointmentId}`),

    // Create a new review
    createReview: async (data) => apiClient.post('/reviews', data)
};

export default reviewsService;
