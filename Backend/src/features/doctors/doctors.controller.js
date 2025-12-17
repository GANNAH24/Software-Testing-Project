/**
 * Doctors Controller
 * Presentation layer for doctors
 */
//Imperative

const doctorsService = require('./doctors.service');
const { successResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

const getAllDoctors = asyncHandler(async (req, res) => {
  const filters = {
    specialty: req.query.specialty,
    location: req.query.location,
    search: req.query.search,
    sortBy: req.query.sortBy
  };
  const doctors = await doctorsService.getAllDoctors(filters);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors`));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.json(successResponse(doctor));
});

const getDoctorsBySpecialty = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.getDoctorsBySpecialty(req.params.specialty);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors in ${req.params.specialty}`));
});

const getDoctorsByLocation = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.getDoctorsByLocation(req.params.location);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors in ${req.params.location}`));
});

const advancedSearchDoctors = asyncHandler(async (req, res) => {
  const filters = {
    searchTerm: req.query.searchTerm || req.query.q,
    specialty: req.query.specialty,
    location: req.query.location,
    minReviews: req.query.minReviews,
    sortBy: req.query.sortBy
  };
  const doctors = await doctorsService.advancedSearchDoctors(filters);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors matching your criteria`));
});

const getDetailedDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDetailedDoctorProfile(req.params.id);
  res.json(successResponse(doctor, 'Doctor profile retrieved successfully'));
});

const createDoctor = asyncHandler(async (req, res) => {
  const doctorData = {
    email: req.body.email,
    password: req.body.password,
    role: "doctor",
    name: req.body.name,
    specialty: req.body.specialty,
    qualifications: req.body.qualifications,
    reviews: req.body.reviews || 0,
    location: req.body.location,
    workingHoursStart: req.body.working_hours_start || '09:00:00',
    workingHoursEnd: req.body.working_hours_end || '17:00:00',
    phone: req.body.phone
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
  if (req.body.working_hours_start) updates.working_hours_start = req.body.working_hours_start;
  if (req.body.working_hours_end) updates.working_hours_end = req.body.working_hours_end;
  if (req.body.phone) updates.phone = req.body.phone;

  const doctor = await doctorsService.updateDoctor(req.params.id, updates);
  res.json(successResponse(doctor, 'Doctor updated successfully'));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorsService.deleteDoctor(req.params.id);
  res.json(successResponse(null, 'Doctor deleted successfully'));
});

const searchDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.searchDoctors(req.query.q, req.query.specialty);
  res.json(successResponse(doctors, `Found ${doctors.length} doctors`));
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsBySpecialty,
  getDoctorsByLocation,
  advancedSearchDoctors,
  getDetailedDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
