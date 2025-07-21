/**
 * Dashboard Business Logic Types
 *
 * Types and interfaces specifically for dashboard business logic operations.
 * These types support dashboard calculations, metrics, and analytics.
 */

/**
 * Dashboard metrics data structure
 */
export interface DashboardMetrics {
  total: number;
  active: number;
  totalLocations: number;
  totalDelta: string;
  activeDelta: string;
  locationsDelta: string;
}

/**
 * SmartMenu widget data for dashboard calculations
 */
export interface SmartMenuWidget {
  id: string;
  createdAt: string;
  publishedAt?: string;
  numberOfLocations?: number;
  isActive?: boolean;
}

/**
 * Time period for dashboard calculations
 */
export interface DashboardTimePeriod {
  start: Date;
  end: Date;
  label: string;
  days: number;
}

/**
 * Dashboard trend calculation result
 */
export interface DashboardTrend {
  current: number;
  previous: number;
  delta: string;
  percentage: number;
  isPositive: boolean;
}

/**
 * Dashboard analytics data
 */
export interface DashboardAnalytics {
  totalActive: number;
  withImages: number;
  withCardLayout: number;
  withOrdering: number;
  withByo: number;
}

/**
 * Dashboard calculation parameters
 */
export interface DashboardCalculationParams {
  widgets: SmartMenuWidget[];
  timePeriod?: DashboardTimePeriod;
  includeInactive?: boolean;
}

/**
 * Dashboard metrics calculation result
 */
export interface DashboardMetricsResult {
  total: number;
  active: number;
  totalLocations: number;
  trends: {
    total: DashboardTrend;
    active: DashboardTrend;
    locations: DashboardTrend;
  };
}

/**
 * Dashboard analytics calculation result
 */
export interface DashboardAnalyticsResult {
  analytics: DashboardAnalytics;
  percentages: {
    images: number;
    cardLayout: number;
    ordering: number;
    byo: number;
  };
}

/**
 * Dashboard summary statistics
 */
export interface DashboardSummary {
  totalSmartMenus: number;
  activeSmartMenus: number;
  totalLocations: number;
  averageLocationsPerMenu: number;
  activationRate: number;
  featureUsage: {
    images: number;
    cardLayout: number;
    ordering: number;
    byo: number;
  };
}

/**
 * Dashboard performance metrics
 */
export interface DashboardPerformance {
  growthRate: number;
  activationTrend: string;
  locationGrowth: number;
  featureAdoption: {
    images: number;
    cardLayout: number;
    ordering: number;
    byo: number;
  };
}

/**
 * Dashboard calculation configuration
 */
export interface DashboardConfig {
  defaultTimePeriod: number; // days
  includeInactive: boolean;
  calculateTrends: boolean;
  includeAnalytics: boolean;
}

/**
 * Default dashboard configuration
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  defaultTimePeriod: 30,
  includeInactive: false,
  calculateTrends: true,
  includeAnalytics: true,
};

/**
 * Dashboard calculation error types
 */
export enum DashboardErrorType {
  INVALID_DATA = "INVALID_DATA",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  CALCULATION_ERROR = "CALCULATION_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

/**
 * Dashboard calculation error
 */
export interface DashboardError {
  type: DashboardErrorType;
  message: string;
  field?: string;
  value?: any;
}

/**
 * Dashboard calculation result with error handling
 */
export interface DashboardCalculationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: DashboardError[];
  warnings?: string[];
}

/**
 * Type guard to check if a value is a SmartMenuWidget
 */
export function isSmartMenuWidget(value: any): value is SmartMenuWidget {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.createdAt === "string"
  );
}

/**
 * Type guard to check if a value is a DashboardMetrics
 */
export function isDashboardMetrics(value: any): value is DashboardMetrics {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.total === "number" &&
    typeof value.active === "number" &&
    typeof value.totalLocations === "number" &&
    typeof value.totalDelta === "string" &&
    typeof value.activeDelta === "string" &&
    typeof value.locationsDelta === "string"
  );
}

/**
 * Type guard to check if a value is a DashboardAnalytics
 */
export function isDashboardAnalytics(value: any): value is DashboardAnalytics {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.totalActive === "number" &&
    typeof value.withImages === "number" &&
    typeof value.withCardLayout === "number" &&
    typeof value.withOrdering === "number" &&
    typeof value.withByo === "number"
  );
}

/**
 * Helper function to create a dashboard trend
 */
export function createDashboardTrend(
  current: number,
  previous: number
): DashboardTrend {
  const percentage =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : ((current - previous) / previous) * 100;

  const delta =
    previous === 0
      ? current > 0
        ? "+100%"
        : "0%"
      : `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;

  return {
    current,
    previous,
    delta,
    percentage,
    isPositive: percentage >= 0,
  };
}

/**
 * Helper function to create a dashboard calculation result
 */
export function createDashboardCalculationResult<T>(
  success: boolean,
  data: T | undefined,
  error?: string,
  errors?: DashboardError[]
): DashboardCalculationResult<T> {
  return {
    success,
    data,
    error,
    errors,
  };
}
