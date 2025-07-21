/**
 * Common Business Logic Types
 *
 * Shared types and interfaces used across business logic modules.
 * These types are UI-independent and can be used in any context.
 */

/**
 * Standard result wrapper for business logic operations
 */
export interface BusinessLogicResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

/**
 * Validation result for data validation operations
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Growth metrics for comparing current vs previous periods
 */
export interface GrowthMetrics {
  current: number;
  previous: number;
  growth: number;
  growthPercent: number;
  isPositive: boolean;
}

/**
 * Time period for metrics calculations
 */
export interface TimePeriod {
  start: Date;
  end: Date;
  label: string;
  type: "day" | "week" | "month" | "quarter" | "year";
}

/**
 * Pagination parameters for data queries
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Pagination result with metadata
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Sorting parameters for data queries
 */
export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Filter parameters for data queries
 */
export interface FilterParams {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "nin"
    | "like"
    | "ilike";
  value: any;
}

/**
 * Query parameters combining pagination, sorting, and filtering
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParams[];
  search?: string;
}

/**
 * Configuration for business logic operations
 */
export interface BusinessLogicConfig {
  enableValidation?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Error types for business logic operations
 */
export enum BusinessLogicErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CALCULATION_ERROR = "CALCULATION_ERROR",
  TRANSFORMATION_ERROR = "TRANSFORMATION_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Business logic error with type and context
 */
export interface BusinessLogicError {
  type: BusinessLogicErrorType;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

/**
 * Success metrics for business logic operations
 */
export interface SuccessMetrics {
  operationName: string;
  duration: number;
  timestamp: Date;
  inputSize?: number;
  outputSize?: number;
  cacheHit?: boolean;
}

/**
 * Default values for common business logic operations
 */
export const DEFAULT_BUSINESS_LOGIC_CONFIG: BusinessLogicConfig = {
  enableValidation: true,
  enableCaching: false,
  cacheTimeout: 300000, // 5 minutes
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

/**
 * Common constants used in business logic
 */
export const BUSINESS_LOGIC_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_CACHE_TIMEOUT: 300000, // 5 minutes
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Type guard to check if a value is a valid business logic result
 */
export function isBusinessLogicResult<T>(
  value: any
): value is BusinessLogicResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.success === "boolean" &&
    (value.data !== undefined || value.error !== undefined)
  );
}

/**
 * Type guard to check if a value is a valid validation result
 */
export function isValidationResult(value: any): value is ValidationResult {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.isValid === "boolean" &&
    Array.isArray(value.errors)
  );
}

/**
 * Helper function to create a successful business logic result
 */
export function createSuccessResult<T>(data: T): BusinessLogicResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper function to create an error business logic result
 */
export function createErrorResult<T>(
  error: string,
  errors?: string[]
): BusinessLogicResult<T> {
  return {
    success: false,
    error,
    errors,
  };
}

/**
 * Helper function to create a validation result
 */
export function createValidationResult(
  isValid: boolean,
  errors: string[] = [],
  warnings?: string[]
): ValidationResult {
  return {
    isValid,
    errors,
    warnings,
  };
}
