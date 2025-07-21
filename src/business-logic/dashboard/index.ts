/**
 * Dashboard Business Logic Index
 *
 * Central export point for all dashboard business logic functions and types.
 */

// Types
export * from "./types";

// Calculations
export * from "./calculations";

// Re-export commonly used dashboard functions
export {
  calculateDashboardAnalytics,
  calculateDashboardMetrics,
  calculateDashboardPerformance,
  calculateDashboardSummary,
  calculatePercentageChange,
  convertToDashboardMetrics,
  createTimePeriod,
  filterWidgetsByTimePeriod,
} from "./calculations";

// Re-export commonly used dashboard types
export type {
  DashboardAnalytics,
  DashboardAnalyticsResult,
  DashboardCalculationResult,
  DashboardConfig,
  DashboardMetrics,
  DashboardMetricsResult,
  DashboardPerformance,
  DashboardSummary,
  DashboardTimePeriod,
  DashboardTrend,
  SmartMenuWidget,
} from "./types";

export {
  DEFAULT_DASHBOARD_CONFIG,
  createDashboardCalculationResult,
  createDashboardTrend,
  isDashboardAnalytics,
  isDashboardMetrics,
  isSmartMenuWidget,
} from "./types";
