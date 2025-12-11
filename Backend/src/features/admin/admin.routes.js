/**
 * Admin Routes
 * Routes for admin operations
 */

const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { requireAdmin } = require('../../shared/middleware/auth.middleware');

// All admin routes require admin role
router.use(requireAdmin());

// System statistics
router.get('/stats', adminController.getSystemStats);

// Doctors management
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Patients management
router.get('/patients', adminController.getAllPatients);
router.put('/patients/:id', adminController.updatePatient);

// Appointments management
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id', adminController.updateAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);

module.exports = router;
