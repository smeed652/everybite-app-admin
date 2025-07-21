/**
 * Validation Types for Business Logic
 *
 * Types and interfaces specifically for data validation operations.
 * These types support comprehensive validation with detailed error reporting.
 */

import { ValidationResult } from "./common";

/**
 * Validation rule for a specific field
 */
export interface ValidationRule {
  field: string;
  type: ValidationRuleType;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

/**
 * Types of validation rules
 */
export enum ValidationRuleType {
  REQUIRED = "REQUIRED",
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  EMAIL = "EMAIL",
  URL = "URL",
  DATE = "DATE",
  MIN = "MIN",
  MAX = "MAX",
  MIN_LENGTH = "MIN_LENGTH",
  MAX_LENGTH = "MAX_LENGTH",
  PATTERN = "PATTERN",
  CUSTOM = "CUSTOM",
}

/**
 * Validation error with detailed information
 */
export interface ValidationError {
  field: string;
  type: ValidationRuleType;
  message: string;
  value?: any;
  expected?: any;
  received?: any;
}

/**
 * Extended validation result with detailed errors
 */
export interface DetailedValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
  fieldErrors?: Record<string, ValidationError[]>;
}

/**
 * Validation schema for complex objects
 */
export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

/**
 * Validation context for custom validation functions
 */
export interface ValidationContext {
  data: any;
  field: string;
  value: any;
  parent?: any;
  path: string[];
}

/**
 * Custom validation function signature
 */
export type CustomValidator = (
  value: any,
  context: ValidationContext
) => boolean | string;

/**
 * Validation configuration
 */
export interface ValidationConfig {
  strict?: boolean;
  allowUnknown?: boolean;
  abortEarly?: boolean;
  stripUnknown?: boolean;
  context?: Record<string, any>;
}

/**
 * Validation result with metadata
 */
export interface ValidationResultWithMetadata extends DetailedValidationResult {
  metadata: {
    validatedAt: Date;
    duration: number;
    fieldsValidated: number;
    rulesApplied: number;
  };
}

/**
 * Field-specific validation result
 */
export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
  value: any;
}

/**
 * Validation summary for multiple fields
 */
export interface ValidationSummary {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  totalErrors: number;
  totalWarnings: number;
  fields: Record<string, FieldValidationResult>;
}

/**
 * Async validation result for operations that require external validation
 */
export interface AsyncValidationResult extends ValidationResult {
  promise: Promise<ValidationResult>;
  isPending: boolean;
}

/**
 * Validation cache for performance optimization
 */
export interface ValidationCache {
  key: string;
  result: ValidationResult;
  timestamp: Date;
  ttl: number;
}

/**
 * Validation performance metrics
 */
export interface ValidationMetrics {
  totalValidations: number;
  averageDuration: number;
  cacheHits: number;
  cacheMisses: number;
  errorRate: number;
}

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  strict: false,
  allowUnknown: true,
  abortEarly: false,
  stripUnknown: false,
};

/**
 * Common validation error messages
 */
export const VALIDATION_ERROR_MESSAGES = {
  REQUIRED: "Field is required",
  INVALID_TYPE: "Invalid type",
  MIN_VALUE: "Value must be at least {min}",
  MAX_VALUE: "Value must be at most {max}",
  MIN_LENGTH: "Length must be at least {min} characters",
  MAX_LENGTH: "Length must be at most {max} characters",
  INVALID_PATTERN: "Value does not match required pattern",
  INVALID_EMAIL: "Invalid email format",
  INVALID_URL: "Invalid URL format",
  INVALID_DATE: "Invalid date format",
  CUSTOM_ERROR: "Validation failed",
} as const;

/**
 * Helper function to create a validation error
 */
export function createValidationError(
  field: string,
  type: ValidationRuleType,
  message: string,
  value?: any,
  expected?: any,
  received?: any
): ValidationError {
  return {
    field,
    type,
    message,
    value,
    expected,
    received,
  };
}

/**
 * Helper function to create a detailed validation result
 */
export function createDetailedValidationResult(
  isValid: boolean,
  errors: ValidationError[] = [],
  warnings?: ValidationError[]
): DetailedValidationResult {
  const fieldErrors: Record<string, ValidationError[]> = {};

  // Group errors by field
  errors.forEach((error) => {
    if (!fieldErrors[error.field]) {
      fieldErrors[error.field] = [];
    }
    fieldErrors[error.field].push(error);
  });

  return {
    isValid,
    errors,
    warnings,
    fieldErrors,
  };
}

/**
 * Helper function to create a validation result with metadata
 */
export function createValidationResultWithMetadata(
  result: DetailedValidationResult,
  duration: number,
  fieldsValidated: number,
  rulesApplied: number
): ValidationResultWithMetadata {
  return {
    ...result,
    metadata: {
      validatedAt: new Date(),
      duration,
      fieldsValidated,
      rulesApplied,
    },
  };
}

/**
 * Type guard to check if a value is a validation error
 */
export function isValidationError(value: any): value is ValidationError {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.field === "string" &&
    typeof value.type === "string" &&
    typeof value.message === "string"
  );
}

/**
 * Type guard to check if a value is a detailed validation result
 */
export function isDetailedValidationResult(
  value: any
): value is DetailedValidationResult {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.isValid === "boolean" &&
    Array.isArray(value.errors) &&
    value.errors.every(isValidationError)
  );
}
