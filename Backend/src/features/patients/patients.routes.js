// src/features/patients/patients.routes.js
const express = require('express');
const PatientsController = require('./patients.controller');

const router = express.Router();

router.get('/', PatientsController.getAll);
router.get('/:id', PatientsController.getById);
router.post('/', PatientsController.create);
router.put('/:id', PatientsController.update);

module.exports = router;
