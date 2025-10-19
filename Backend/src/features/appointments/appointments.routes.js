/**
 * Appointments Routes
 * API endpoints for appointments
 */

const express = require('express');
const router = express.Router();
const appointmentsController = require('./appointments.controller');
const { requireAuth, requirePatient, requireAnyRole, requireDoctor } = require('../../shared/middleware/auth.middleware');

// All appointment routes require authentication
router.use(requireAuth());

// Get all appointments (with filters)
router.get('/', appointmentsController.getAllAppointments);

// Get my upcoming/past appointments
router.get('/upcoming', appointmentsController.getUpcomingAppointments);
router.get('/past', appointmentsController.getPastAppointments);

// Patient appointments
router.get('/patient/:patientId', appointmentsController.getPatientAppointments);

// Doctor appointments
router.get('/doctor/:doctorId', appointmentsController.getDoctorAppointments);

// Create appointment (patients only)
router.post('/', requirePatient(), appointmentsController.createAppointment);

// Get specific appointment
router.get('/:id', appointmentsController.getAppointmentById);

// Update appointment (patient or doctor)
router.put('/:id', requireAnyRole('patient', 'doctor'), appointmentsController.updateAppointment);

// Cancel appointment
router.patch('/:id/cancel', requireAnyRole('patient', 'doctor'), appointmentsController.cancelAppointment);

// Complete appointment (doctors only)
router.patch('/:id/complete', requireDoctor(), appointmentsController.completeAppointment);

// Delete appointment (patient, doctor, or admin)
router.delete('/:id', requireAnyRole('patient', 'doctor', 'admin'), appointmentsController.deleteAppointment);

module.exports = router;
