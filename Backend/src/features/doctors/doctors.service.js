/**
 * Doctors Service
 * Business logic for doctors
 */

const doctorsRepository = require("./doctors.repository");
const logger = require("../../shared/utils/logger.util");

const getAllDoctors = async (filters) => {
  return await doctorsRepository.findAll(filters);
};

const getDoctorById = async (doctorId) => {
  const doctor = await doctorsRepository.findById(doctorId);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  return doctor;
};

const getDoctorByUserId = async (userId) => {
  const doctor = await doctorsRepository.findByUserId(userId);
  if (!doctor) {
    throw new Error("Doctor profile not found");
  }
  return doctor;
};

const getDoctorsBySpecialty = async (specialty) => {
  return await doctorsRepository.findBySpecialty(specialty);
};

const getDoctorsByLocation = async (location) => {
  return await doctorsRepository.findByLocation(location);
};

const advancedSearchDoctors = async (filters) => {
  // Validate and sanitize filters
  const searchFilters = {
    searchTerm: filters.searchTerm?.trim() || null,
    specialty: filters.specialty?.trim() || null,
    location: filters.location?.trim() || null,
    minReviews: filters.minReviews ? parseInt(filters.minReviews) : null,
    sortBy: filters.sortBy || "reviews",
  };

  return await doctorsRepository.advancedSearch(searchFilters);
};

const getDetailedDoctorProfile = async (doctorId) => {
  const doctor = await doctorsRepository.getDetailedProfile(doctorId);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};

const createDoctor = async (doctorData) => {
  const doctor = await doctorsRepository.create(doctorData);
  logger.info("Doctor created", { doctorId: doctor.id });
  return doctor;
};

const updateDoctor = async (doctorId, updates) => {
  const existing = await doctorsRepository.findById(doctorId);
  if (!existing) {
    throw new Error("Doctor not found");
  }

  const doctor = await doctorsRepository.update(doctorId, updates);
  logger.info("Doctor updated", { doctorId });
  return doctor;
};

const deleteDoctor = async (doctorId) => {
  const existing = await doctorsRepository.findById(doctorId);
  if (!existing) {
    throw new Error("Doctor not found");
  }

  await doctorsRepository.softDelete(doctorId);
  logger.info("Doctor deleted", { doctorId });
  return { success: true };
};

const searchDoctors = async (searchTerm, specialty = null) => {
  // If no search criteria provided, return empty array
  if (!searchTerm && !specialty) {
    return [];
  }

  const filters = {};
  if (searchTerm) filters.search = searchTerm;
  if (specialty) filters.specialty = specialty;

  const doctors = await doctorsRepository.advancedSearch(filters);

  // IMPORTANT: if search was requested but no matches → return empty array
  return doctors || [];
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getById: getDoctorById, // Alias
  getDoctorByUserId,
  getByUserId: getDoctorByUserId, // Alias
  getDoctorsBySpecialty,
  getDoctorsByLocation,
  advancedSearchDoctors,
  getDetailedDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors,
};
