import apiClient from './api.service';

const patientService = {
  list: async () => apiClient.get('/patients'),
  byId: async (id) => apiClient.get(`/patients/${id}`),
  create: async (data) => apiClient.post('/patients', data),
  update: async (id, data) => apiClient.put(`/patients/${id}`, data),
  appointments: async (id) => apiClient.get(`/patients/${id}/appointments`),
  cancelAppointment: async (id, appointmentId) => apiClient.patch(`/patients/${id}/appointments/cancel`, { appointmentId })
};

export default patientService;