const express = require('express');
const PatientsController = require('./patients.controller');
const { requireAuth } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.get('/', PatientsController.getAll);
router.get('/:id', PatientsController.getById);
router.post('/', PatientsController.create);
router.put('/:id', PatientsController.update);

// ✅ New routes with authentication
router.get('/:id/appointments', requireAuth, PatientsController.getAppointments);
router.patch('/:id/appointments/cancel', requireAuth, PatientsController.cancelAppointment);

module.exports = router;
