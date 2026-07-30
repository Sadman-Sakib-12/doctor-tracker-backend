import { Router } from 'express';
import {
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller';
import { protect } from '../middlewares/auth.middleware';
import { patientRules } from '../validators/patient.validator';
import validate from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

router.route('/').get(getPatients);

router
  .route('/:id')
  .get(getPatient)
  .put(patientRules, validate, updatePatient)
  .delete(deletePatient);

export default router;
