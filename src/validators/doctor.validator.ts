import { body, ValidationChain } from 'express-validator';

export const doctorRules: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('hospital').trim().notEmpty().withMessage('Hospital is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[+\d\s\-()]{7,20}$/)
    .withMessage('Invalid phone number'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];
