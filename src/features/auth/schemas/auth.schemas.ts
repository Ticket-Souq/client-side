  import type { FieldRule } from '../../../shared/validation';

export const emailRules: FieldRule = {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  patternMessage: 'Enter a valid email',
};

export const passwordRules: FieldRule = {
  required: true,
  minLength: 8,
};

export const nameRules: FieldRule = {
  required: true,
  minLength: 3,
  maxLength: 50,
};

export const orgNameRules: FieldRule = {
  required: true,
  minLength: 3,
  maxLength: 50,
};

export const requiredRules: FieldRule = {
  required: true,
};
