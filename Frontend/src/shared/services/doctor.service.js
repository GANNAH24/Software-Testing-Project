import apiClient from './api.service';

const doctorService = {
  list: async (params = {}) => apiClient.get('/doctors', { params }),
  search: async (q, specialty) => apiClient.get('/doctors/search', { params: { q, specialty } }),
  advancedSearch: async (filters = {}) => apiClient.get('/doctors/advanced-search', { params: filters }),
  byId: async (id) => apiClient.get(`/doctors/${id}`),
  profile: async (id) => apiClient.get(`/doctors/${id}/profile`),
  bySpecialty: async (specialty) => apiClient.get(`/doctors/specialty/${specialty}`),
  byLocation: async (location) => apiClient.get(`/doctors/location/${location}`),
  create: async (data) => apiClient.post('/doctors', data),
  update: async (id, data) => apiClient.put(`/doctors/${id}`, data),
  remove: async (id) => apiClient.delete(`/doctors/${id}`)
};

export default doctorService;