import { API_BASE_URL, API_TIMEOUT } from './constants';

// API Configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Patients
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id) => `/patients/${id}`,
    PROFILE: '/patients/profile',
    APPOINTMENTS: '/patients/appointments',
  },
  
  // Doctors
  DOCTORS: {
    BASE: '/doctors',
    BY_ID: (id) => `/doctors/${id}`,
    PROFILE: '/doctors/profile',
    SEARCH: '/doctors/search',
    SPECIALTIES: '/doctors/specialties',
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id) => `/appointments/${id}`,
    CREATE: '/appointments/create',
    UPDATE: (id) => `/appointments/${id}/update`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    COMPLETE: (id) => `/appointments/${id}/complete`,
  },
  
  // Schedules
  SCHEDULES: {
    BASE: '/schedules',
    BY_ID: (id) => `/schedules/${id}`,
    BY_DOCTOR: (doctorId) => `/schedules/doctor/${doctorId}`,
    AVAILABLE_SLOTS: '/schedules/available-slots',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
  },
};

export default apiConfig;
