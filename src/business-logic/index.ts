/**
 * Business Logic Index
 *
 * Central export point for all business logic functions, types, and utilities.
 * Import from this file to get access to all business logic functionality.
 */

// Types
export * from "./types";

// Validation
export * from "./validation";

// Calculations
export * from "./calculations";

// Utils
export * from "./utils";

// Dashboard business logic
export * from "./dashboard";

// Quarterly metrics (specific exports)
export {
  QuarterlyMetricInput,
  QuarterlyMetricOutput,
  calculateOrdersDelta,
  calculateTotalOrders,
  transformQuarterlyData,
  validateQuarterlyMetrics,
} from "./quarterly-metrics/transformers";

export {
  calculateAverageOrdersPerQuarter,
  calculateCAGR,
  calculateGrowthMetrics,
  calculateMetricGrowthRate,
  calculateQoQGrowth,
  calculateSummaryStatistics,
  calculateTotalActiveSmartMenus,
  calculateTotalBrands,
  calculateTotalLocations,
  calculateTotalRevenue,
  calculateTrendDirection,
  calculateYoYGrowth,
} from "./quarterly-metrics/calculations";

// Validation functions
export {
  validateChronologicalOrder,
  validateGrowthPercentage,
  validateQuarterLabel,
  validateQuarterlyMetricsDetailed,
} from "./validation/quarterly-metrics";
