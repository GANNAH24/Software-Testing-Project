import apiClient from './api.service';

const adminService = {
  // System stats
  getStats: async () => apiClient.get('/admin/stats'),

  // Doctors
  getAllDoctors: async (params = {}) => apiClient.get('/admin/doctors', { params }),
  createDoctor: async (data) => apiClient.post('/admin/doctors', data),
  updateDoctor: async (id, data) => apiClient.put(`/admin/doctors/${id}`, data),
  deleteDoctor: async (id) => apiClient.delete(`/admin/doctors/${id}`),

  // Patients
  getAllPatients: async (params) => apiClient.get('/admin/patients', { params }),
  createPatient: async (patientData) => apiClient.post('/admin/patients', patientData),
  updatePatient: async (patientId, patientData) => apiClient.put(`/admin/patients/${patientId}`, patientData),
  deletePatient: async (id) => apiClient.delete(`/admin/patients/${id}`),

  // Appointments
  getAllAppointments: async (params = {}) => apiClient.get('/admin/appointments', { params }),
  updateAppointment: async (id, data) => apiClient.put(`/admin/appointments/${id}`, data),
  deleteAppointment: async (id) => apiClient.delete(`/admin/appointments/${id}`),

  // Analytics
  getSpecialtyAnalytics: async () => apiClient.get('/admin/analytics/specialties'),
  getTopDoctors: async (limit = 10) => apiClient.get('/admin/analytics/top-doctors', { params: { limit } }),
  getAnalyticsOverview: async () => apiClient.get('/admin/analytics/overview')
};

export default adminService;
