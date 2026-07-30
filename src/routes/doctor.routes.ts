import { Router, Request, Response, NextFunction } from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} from '../controllers/doctor.controller';
import { createPatient } from '../controllers/patient.controller';
import { protect } from '../middlewares/auth.middleware';
import { doctorRules } from '../validators/doctor.validator';
import { patientRules } from '../validators/patient.validator';
import validate from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

router.route('/').get(getDoctors).post(doctorRules, validate, createDoctor);

router
  .route('/:id')
  .get(getDoctor)
  .put(doctorRules, validate, updateDoctor)
  .delete(deleteDoctor);

// Nested: patients under a doctor
router
  .route('/:id/patients')
  .get(getDoctorPatients)
  .post(
    (req: Request, _res: Response, next: NextFunction) => {
      req.body.doctor = req.params.id;
      next();
    },
    patientRules,
    validate,
    createPatient
  );

export default router;
