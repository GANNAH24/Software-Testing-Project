import express from 'express';
import { 
    getAllDoctors, 
    getDoctorById, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor 
} from './doctorController.js';

const router = express.Router();

// Define CRUD routes for the base path: /api/v1/doctors
// CREATE: POST request to add a new doctor
router.post('/', createDoctor);           
// READ ALL: GET request to fetch the list of doctors
router.get('/', getAllDoctors);           

// Routes that operate on a specific doctor (identified by :id)
// READ ONE: GET request for a specific doctor
router.get('/:id', getDoctorById);        
// UPDATE: PUT request to modify a specific doctor
router.put('/:id', updateDoctor);         
// DELETE: DELETE request to remove a specific doctor
router.delete('/:id', deleteDoctor);       

export default router;
