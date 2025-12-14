import apiClient from "./api.service";

const scheduleService = {
  list: async (params = {}) => apiClient.get("/schedules", { params }),
  byId: async (id) => apiClient.get(`/schedules/${id}`),
  byDoctor: async (doctorId, params = {}) => {
    // Backend expects doctorId as query parameter, not path parameter
    return apiClient.get("/schedules", { params: { ...params, doctorId } });
  },
  availableSlots: async (doctorId, date) => {
    // Support both parameter styles
    if (typeof doctorId === "object") {
      return apiClient.get("/schedules/available", { params: doctorId });
    }
    return apiClient.get("/schedules/available", {
      params: { doctor_id: doctorId, date },
    });
  },

  create: async (data) => apiClient.post("/schedules", data),
  update: async (id, data) => apiClient.put(`/schedules/${id}`, data),
  remove: async (id) => apiClient.delete(`/schedules/${id}`),
};

export default scheduleService;
