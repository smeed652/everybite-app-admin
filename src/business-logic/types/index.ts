/**
 * Business Logic Types Index
 *
 * Central export point for all business logic types and interfaces.
 * Import from this file to get access to all business logic types.
 */

// Common types
export * from "./common";

// Validation types
export * from "./validation";

// Re-export commonly used types for convenience
export type {
  BusinessLogicConfig,
  BusinessLogicError,
  BusinessLogicResult,
  FilterParams,
  GrowthMetrics,
  PaginationParams,
  PaginationResult,
  QueryParams,
  SortParams,
  SuccessMetrics,
  TimePeriod,
  ValidationResult,
} from "./common";

export type {
  AsyncValidationResult,
  CustomValidator,
  DetailedValidationResult,
  FieldValidationResult,
  ValidationCache,
  ValidationConfig,
  ValidationContext,
  ValidationError,
  ValidationMetrics,
  ValidationResultWithMetadata,
  ValidationRule,
  ValidationSchema,
  ValidationSummary,
} from "./validation";

export {
  BUSINESS_LOGIC_CONSTANTS,
  BusinessLogicErrorType,
  DEFAULT_BUSINESS_LOGIC_CONFIG,
  createErrorResult,
  createSuccessResult,
  createValidationResult,
  isBusinessLogicResult,
  isValidationResult,
} from "./common";

export {
  DEFAULT_VALIDATION_CONFIG,
  VALIDATION_ERROR_MESSAGES,
  ValidationRuleType,
  createDetailedValidationResult,
  createValidationError,
  createValidationResultWithMetadata,
  isDetailedValidationResult,
  isValidationError,
} from "./validation";
