import { param, ValidationChain } from 'express-validator';

/**
 * Reusable validator for MongoDB ObjectId route params.
 */
export const validateObjectId = (paramName = 'id'): ValidationChain =>
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`);
