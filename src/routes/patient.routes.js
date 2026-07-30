const router = require('express').Router();
const {
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const { patientRules } = require('../validators/patient.validator');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

router.route('/').get(getPatients);

router
  .route('/:id')
  .get(getPatient)
  .put(patientRules, validate, updatePatient)
  .delete(deletePatient);

module.exports = router;
