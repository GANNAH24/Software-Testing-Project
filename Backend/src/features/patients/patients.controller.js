// src/features/patients/patients.controller.js
const PatientsService = require('./patients.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');

const PatientsController = {
  async getAll(req, res) {
    try {
      const patients = await PatientsService.listAll();
      successResponse(res, 'Patients retrieved successfully', patients);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async getById(req, res) {
    try {
      const patient = await PatientsService.getById(req.params.id);
      if (!patient) return errorResponse(res, 'Patient not found', 404);
      successResponse(res, 'Patient retrieved successfully', patient);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async create(req, res) {
    try {
      const patient = await PatientsService.create(req.body);
      successResponse(res, 'Patient created successfully', patient);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  async update(req, res) {
    try {
      const patient = await PatientsService.update(req.params.id, req.body);
      successResponse(res, 'Patient updated successfully', patient);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
};

module.exports = PatientsController;
