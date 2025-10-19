/**
 * Doctors Routes
 * API endpoints for doctors
 */

const express = require('express');
const router = express.Router();
const doctorsController = require('./doctors.controller');
const { optionalAuth, requireAdmin, requireAnyRole } = require('../../shared/middleware/auth.middleware');

// Public routes (browsing doctors)
router.get('/', optionalAuth, doctorsController.getAllDoctors);
router.get('/search', optionalAuth, doctorsController.searchDoctors);
router.get('/specialty/:specialty', optionalAuth, doctorsController.getDoctorsBySpecialty);
router.get('/:id', optionalAuth, doctorsController.getDoctorById);

// Protected routes (admin only)
router.post('/', requireAdmin(), doctorsController.createDoctor);
router.delete('/:id', requireAdmin(), doctorsController.deleteDoctor);

// Update doctor (doctor or admin)
router.put('/:id', requireAnyRole('doctor', 'admin'), doctorsController.updateDoctor);

module.exports = router;
