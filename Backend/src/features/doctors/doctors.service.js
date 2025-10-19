/**
 * Doctors Service
 * Business logic for doctors
 */

const doctorsRepository = require('./doctors.repository');
const logger = require('../../../shared/utils/logger.util');

const getAllDoctors = async (filters) => {
  return await doctorsRepository.findAll(filters);
};

const getDoctorById = async (doctorId) => {
  const doctor = await doctorsRepository.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }
  return doctor;
};

const getDoctorByUserId = async (userId) => {
  const doctor = await doctorsRepository.findByUserId(userId);
  if (!doctor) {
    throw new Error('Doctor profile not found');
  }
  return doctor;
};

const getDoctorsBySpecialty = async (specialty) => {
  return await doctorsRepository.findBySpecialty(specialty);
};

const createDoctor = async (doctorData) => {
  const doctor = await doctorsRepository.create(doctorData);
  logger.info('Doctor created', { doctorId: doctor.id });
  return doctor;
};

const updateDoctor = async (doctorId, updates) => {
  const existing = await doctorsRepository.findById(doctorId);
  if (!existing) {
    throw new Error('Doctor not found');
  }

  const doctor = await doctorsRepository.update(doctorId, updates);
  logger.info('Doctor updated', { doctorId });
  return doctor;
};

const deleteDoctor = async (doctorId) => {
  const existing = await doctorsRepository.findById(doctorId);
  if (!existing) {
    throw new Error('Doctor not found');
  }

  await doctorsRepository.softDelete(doctorId);
  logger.info('Doctor deleted', { doctorId });
  return { success: true };
};

const searchDoctors = async (searchTerm, specialty = null) => {
  const filters = {};
  if (searchTerm) filters.search = searchTerm;
  if (specialty) filters.specialty = specialty;
  return await doctorsRepository.findAll(filters);
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  getDoctorsBySpecialty,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
