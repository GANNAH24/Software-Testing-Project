const PatientsService = require('./patients.service');

const PatientsController = {
  async getAll(req, res) {
    try {
      const patients = await PatientsService.listAll();
      return res.status(200).json({
        success: true,
        message: 'Patients retrieved successfully',
        data: patients
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve patients',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const patient = await PatientsService.getById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Patient retrieved successfully',
        data: patient
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve patient',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const patient = await PatientsService.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create patient',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const patient = await PatientsService.update(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: patient
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update patient',
        error: error.message
      });
    }
  },

  // ✅ New: Get appointments for a patient
  async getAppointments(req, res) {
    try {
      const patientId = req.params.id;
      
      // Authorization: Ensure the authenticated user matches the requested patient
      if (req.user && req.user.id !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own appointments'
        });
      }
      
      const data = await PatientsService.getAppointments(patientId);
      return res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve appointments',
        error: error.message
      });
    }
  },

  // ✅ New: Cancel an appointment
  async cancelAppointment(req, res) {
    try {
      const patientId = req.params.id; // optional, for validation
      const { appointmentId, cancelReason } = req.body;
      const data = await PatientsService.cancelAppointment(appointmentId, cancelReason);
      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel appointment',
        error: error.message
      });
    }
  }
};

module.exports = PatientsController;
