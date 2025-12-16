// Application Constants

// API Configuration (aligned with backend default PORT 3000 and version v1)
// Backend serves versioned endpoints at /api/v1; health at /health (outside prefix)
// Note: Vite exposes env vars via import.meta.env and requires VITE_ prefix
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const API_TIMEOUT = 30000;

// Brand Colors
export const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled", // new
  BOOKED: "booked", // new
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Define which ones are "active" (upcoming)
export const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.SCHEDULED,
  APPOINTMENT_STATUS.BOOKED,
  APPOINTMENT_STATUS.CONFIRMED,
];


// Doctor Specialties
export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "General Practice",
  "Dentistry",
];

// Time Slots
export const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

// Pagination
export const ITEMS_PER_PAGE = 10;

// Date Formats
export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm";

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "se7ety_auth_token",
  USER_DATA: "se7ety_user_data",
  THEME: "se7ety_theme",
};
