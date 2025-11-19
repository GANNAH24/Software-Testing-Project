import apiClient from './api.service';

const scheduleService = {
  list: async (params = {}) => apiClient.get('/schedules', { params }),
  byId: async (id) => apiClient.get(`/schedules/${id}`),
  byDoctor: async (doctorId) => apiClient.get(`/schedules/doctor/${doctorId}`),
  availableSlots: async (params = {}) => apiClient.get('/schedules/available-slots', { params })
};

export default scheduleService;