const express = require('express');
const PatientsController = require('./patients.controller');

const router = express.Router();

router.get('/', PatientsController.getAll);
router.get('/:id', PatientsController.getById);
router.post('/', PatientsController.create);
router.put('/:id', PatientsController.update);

// ✅ New routes
router.get('/:id/appointments', PatientsController.getAppointments);
router.patch('/:id/appointments/cancel', PatientsController.cancelAppointment);

module.exports = router;
