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

// Get my appointments (current user)
router.get('/my', appointmentsController.getMyAppointments);

// Get my upcoming/past appointments
router.get('/upcoming', appointmentsController.getUpcomingAppointments);
router.get('/past', appointmentsController.getPastAppointments);

// Doctor appointments (without parameter for current doctor)
router.get('/doctor', requireDoctor(), appointmentsController.getMyAppointments);

// Get all appointments (with filters)
router.get('/', appointmentsController.getAllAppointments);

// Patient appointments
router.get('/patient/:patientId', appointmentsController.getPatientAppointments);

// Create appointment (patients only)
router.post('/', requirePatient(), appointmentsController.createAppointment);

// Doctor appointments with ID (must come before /:id)
router.get('/doctor/:doctorId', appointmentsController.getDoctorAppointments);

// Get specific appointment (requires authentication)
router.get('/:id', requireAnyRole('patient', 'doctor'), appointmentsController.getAppointmentById);

// Update appointment (patient or doctor)
router.put('/:id', requireAnyRole('patient', 'doctor'), appointmentsController.updateAppointment);

// Cancel appointment
router.patch('/:id/cancel', requireAnyRole('patient', 'doctor'), appointmentsController.cancelAppointment);

// Complete appointment (doctors only)
router.patch('/:id/complete', requireDoctor(), appointmentsController.completeAppointment);

// Delete appointment (patient, doctor, or admin)
router.delete('/:id', requireAnyRole('patient', 'doctor', 'admin'), appointmentsController.deleteAppointment);

module.exports = router;
