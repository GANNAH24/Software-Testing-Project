/**
 * Schedules Routes
 * API endpoints for doctor schedules
 */

const express = require('express');
const router = express.Router();
const schedulesController = require('./schedules.controller');
const { requireAuth, requireDoctor } = require('../../shared/middleware/auth.middleware');

// All schedule routes require authentication
router.use(requireAuth());

// Core schedule endpoints
router.get('/', schedulesController.getAllSchedules); // Get all schedules (public with auth)
router.post('/', requireDoctor(), schedulesController.createSchedule);
router.get('/weekly', requireDoctor(), schedulesController.getWeeklySchedule);
router.get('/daily', requireDoctor(), schedulesController.getDailySchedule);
router.post('/block-time', requireDoctor(), schedulesController.blockTime);

// Update schedule (set available/unavailable or change time)
router.patch('/:id', requireDoctor(), schedulesController.updateSchedule);
router.put('/:id', requireDoctor(), schedulesController.updateSchedule);

// Delete schedule
router.delete('/:id', requireDoctor(), schedulesController.deleteSchedule);

module.exports = router;