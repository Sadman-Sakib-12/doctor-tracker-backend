const { body } = require('express-validator');

const CONDITIONS = ['stable', 'critical', 'recovering', 'chronic', 'discharged', 'under observation'];

const patientRules = [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be a number between 0 and 150'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('condition')
    .isIn(CONDITIONS)
    .withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}`),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+\d\s\-()]{7,20}$/)
    .withMessage('Invalid phone number'),
];

module.exports = { patientRules };
