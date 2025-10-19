/**
 * Doctors Controller
 * Presentation layer for doctors
 */

const doctorsService = require('./doctors.service');
const { successResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

const getAllDoctors = asyncHandler(async (req, res) => {
  const filters = {
    specialty: req.query.specialty,
    search: req.query.search
  };
  const doctors = await doctorsService.getAllDoctors(filters);
  res.json(successResponse(doctors));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.json(successResponse(doctor));
});

const getDoctorsBySpecialty = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.getDoctorsBySpecialty(req.params.specialty);
  res.json(successResponse(doctors));
});

const createDoctor = asyncHandler(async (req, res) => {
  const doctorData = {
    userId: req.body.user_id,
    name: req.body.name,
    specialty: req.body.specialty,
    qualifications: req.body.qualifications,
    reviews: req.body.reviews || 0,
    location: req.body.location
  };
  const doctor = await doctorsService.createDoctor(doctorData);
  res.status(201).json(successResponse(doctor, 'Doctor created successfully', 201));
});

const updateDoctor = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.specialty) updates.specialty = req.body.specialty;
  if (req.body.qualifications) updates.qualifications = req.body.qualifications;
  if (req.body.reviews !== undefined) updates.reviews = req.body.reviews;
  if (req.body.location) updates.location = req.body.location;

  const doctor = await doctorsService.updateDoctor(req.params.id, updates);
  res.json(successResponse(doctor, 'Doctor updated successfully'));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorsService.deleteDoctor(req.params.id);
  res.json(successResponse(null, 'Doctor deleted successfully'));
});

const searchDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.searchDoctors(req.query.q, req.query.specialty);
  res.json(successResponse(doctors));
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsBySpecialty,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
