const router = require('express').Router();
const {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} = require('../controllers/doctor.controller');
const { createPatient } = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const { doctorRules } = require('../validators/doctor.validator');
const { patientRules } = require('../validators/patient.validator');
const validate = require('../middlewares/validate.middleware');

// All doctor routes require authentication
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
    (req, _res, next) => {
      // Inject doctorId from URL into body so validator can check it
      req.body.doctor = req.params.id;
      next();
    },
    patientRules,
    validate,
    createPatient
  );

module.exports = router;
