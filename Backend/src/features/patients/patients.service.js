// src/features/patients/patients.service.js
const PatientsRepository = require('./patients.repository');

const PatientsService = {
  async listAll() {
    return await PatientsRepository.getAllPatients();
  },

  async getById(id) {
    return await PatientsRepository.getPatientById(id);
  },

  async create(patientData) {
    return await PatientsRepository.createPatient(patientData);
  },

  async update(id, updates) {
    return await PatientsRepository.updatePatient(id, updates);
  }
};

module.exports = PatientsService;
