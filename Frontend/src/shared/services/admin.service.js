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
  getAllPatients: async (params = {}) => apiClient.get('/admin/patients', { params }),
  updatePatient: async (id, data) => apiClient.put(`/admin/patients/${id}`, data),

  // Appointments
  getAllAppointments: async (params = {}) => apiClient.get('/admin/appointments', { params }),
  updateAppointment: async (id, data) => apiClient.put(`/admin/appointments/${id}`, data),
  deleteAppointment: async (id) => apiClient.delete(`/admin/appointments/${id}`)
};

export default adminService;
