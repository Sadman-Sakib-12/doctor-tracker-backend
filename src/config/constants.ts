/**
 * App-wide constants — keeps magic numbers out of business logic.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const JWT = {
  DEFAULT_EXPIRES_IN: '7d',
} as const;

export const PATIENT_CONDITIONS = [
  'stable',
  'critical',
  'recovering',
  'chronic',
  'discharged',
  'under observation',
] as const;

export const GENDERS = ['male', 'female', 'other'] as const;
