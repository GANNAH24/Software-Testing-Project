import apiClient from './api.service';

const appointmentService = {
  list: async (params = {}) => apiClient.get('/appointments', { params }),
  upcoming: async () => apiClient.get('/appointments/upcoming'),
  past: async () => apiClient.get('/appointments/past'),
  byPatient: async (patientId) => apiClient.get(`/appointments/patient/${patientId}`),
  byDoctor: async (doctorId) => apiClient.get(`/appointments/doctor/${doctorId}`),
  create: async (data) => apiClient.post('/appointments', data),
  get: async (id) => apiClient.get(`/appointments/${id}`),
  update: async (id, data) => apiClient.put(`/appointments/${id}`, data),
  cancel: async (id) => apiClient.patch(`/appointments/${id}/cancel`),
  complete: async (id) => apiClient.patch(`/appointments/${id}/complete`),
  remove: async (id) => apiClient.delete(`/appointments/${id}`)
};

export default appointmentService;