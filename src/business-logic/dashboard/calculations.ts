/**
 * Dashboard Business Logic Calculations
 *
 * Pure functions for dashboard calculations and analytics.
 * These functions are UI-independent and can be tested separately.
 */

import { isAfter, subDays } from "date-fns";
import {
  createDashboardCalculationResult,
  createDashboardTrend,
  DashboardAnalytics,
  DashboardAnalyticsResult,
  DashboardCalculationResult,
  DashboardConfig,
  DashboardMetrics,
  DashboardMetricsResult,
  DashboardPerformance,
  DashboardSummary,
  DashboardTimePeriod,
  DEFAULT_DASHBOARD_CONFIG,
  isSmartMenuWidget,
} from "./types";

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const percentage = ((current - previous) / previous) * 100;
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
}

/**
 * Create a time period for dashboard calculations
 */
export function createTimePeriod(days: number = 30): DashboardTimePeriod {
  const end = new Date();
  const start = subDays(end, days);

  return {
    start,
    end,
    label: `${days}-day period`,
    days,
  };
}

/**
 * Filter widgets by time period
 */
export function filterWidgetsByTimePeriod(
  widgets: any[],
  timePeriod: DashboardTimePeriod,
  field: "createdAt" | "publishedAt" = "createdAt"
): any[] {
  return widgets.filter((widget) => {
    const date = new Date(widget[field]);
    return isAfter(date, timePeriod.start) && date <= timePeriod.end;
  });
}

/**
 * Calculate dashboard metrics from SmartMenu widgets
 */
export function calculateDashboardMetrics(
  widgets: any[],
  config: DashboardConfig = DEFAULT_DASHBOARD_CONFIG
): DashboardCalculationResult<DashboardMetricsResult> {
  // Validate input
  if (!Array.isArray(widgets)) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "Widgets must be an array",
      [
        {
          type: "INVALID_DATA" as any,
          message: "Widgets must be an array",
          field: "widgets",
        },
      ]
    ) as unknown as DashboardCalculationResult<DashboardMetricsResult>;
  }

  // Filter valid widgets
  const validWidgets = widgets.filter(isSmartMenuWidget);

  if (validWidgets.length === 0) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "No valid widgets found",
      [{ type: "INSUFFICIENT_DATA" as any, message: "No valid widgets found" }]
    ) as unknown as DashboardCalculationResult<DashboardMetricsResult>;
  }

  // Calculate basic metrics
  const total = validWidgets.length;
  const active = validWidgets.filter((w) => w.publishedAt).length;
  const totalLocations = validWidgets.reduce(
    (sum, w) => sum + (w.numberOfLocations || 0),
    0
  );

  // Calculate trends if enabled
  let trends = {
    total: createDashboardTrend(0, 0),
    active: createDashboardTrend(0, 0),
    locations: createDashboardTrend(0, 0),
  };

  if (config.calculateTrends) {
    const _timePeriod = createTimePeriod(config.defaultTimePeriod);
    const currentPeriod = createTimePeriod(config.defaultTimePeriod);
    const previousPeriod = {
      start: subDays(currentPeriod.start, config.defaultTimePeriod),
      end: currentPeriod.start,
      label: `Previous ${config.defaultTimePeriod}-day period`,
      days: config.defaultTimePeriod,
    };

    // Calculate current period metrics
    const currentCreated = filterWidgetsByTimePeriod(
      validWidgets,
      currentPeriod,
      "createdAt"
    ).length;
    const currentActive = filterWidgetsByTimePeriod(
      validWidgets,
      currentPeriod,
      "publishedAt"
    ).length;
    const currentLocations = filterWidgetsByTimePeriod(
      validWidgets,
      currentPeriod,
      "publishedAt"
    ).reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);

    // Calculate previous period metrics
    const previousCreated = filterWidgetsByTimePeriod(
      validWidgets,
      previousPeriod,
      "createdAt"
    ).length;
    const previousActive = filterWidgetsByTimePeriod(
      validWidgets,
      previousPeriod,
      "publishedAt"
    ).length;
    const previousLocations = filterWidgetsByTimePeriod(
      validWidgets,
      previousPeriod,
      "publishedAt"
    ).reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);

    trends = {
      total: createDashboardTrend(currentCreated, previousCreated),
      active: createDashboardTrend(currentActive, previousActive),
      locations: createDashboardTrend(currentLocations, previousLocations),
    };
  }

  const result: DashboardMetricsResult = {
    total,
    active,
    totalLocations,
    trends,
  };

  return createDashboardCalculationResult(true, result);
}

/**
 * Calculate dashboard analytics from SmartMenu widgets
 */
export function calculateDashboardAnalytics(
  widgets: any[],
  analytics: any
): DashboardCalculationResult<DashboardAnalyticsResult> {
  // Validate input
  if (!Array.isArray(widgets)) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "Widgets must be an array",
      [
        {
          type: "INVALID_DATA" as any,
          message: "Widgets must be an array",
          field: "widgets",
        },
      ]
    );
  }

  if (!analytics || typeof analytics !== "object") {
    return createDashboardCalculationResult(
      false,
      undefined,
      "Analytics data is required",
      [
        {
          type: "INVALID_DATA" as any,
          message: "Analytics data is required",
          field: "analytics",
        },
      ]
    );
  }

  // Extract analytics data
  const totalActive = analytics.totalActive || 0;
  const withImages = analytics.withImages || 0;
  const withCardLayout = analytics.withCardLayout || 0;
  const withOrdering = analytics.withOrdering || 0;
  const withByo = analytics.withByo || 0;

  // Calculate percentages
  const percentages = {
    images: totalActive > 0 ? (withImages / totalActive) * 100 : 0,
    cardLayout: totalActive > 0 ? (withCardLayout / totalActive) * 100 : 0,
    ordering: totalActive > 0 ? (withOrdering / totalActive) * 100 : 0,
    byo: totalActive > 0 ? (withByo / totalActive) * 100 : 0,
  };

  const analyticsData: DashboardAnalytics = {
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  };

  const result: DashboardAnalyticsResult = {
    analytics: analyticsData,
    percentages,
  };

  return createDashboardCalculationResult(true, result);
}

/**
 * Calculate dashboard summary statistics
 */
export function calculateDashboardSummary(
  widgets: any[],
  analytics?: any
): DashboardCalculationResult<DashboardSummary> {
  // Validate input
  if (!Array.isArray(widgets)) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "Widgets must be an array",
      [
        {
          type: "INVALID_DATA" as any,
          message: "Widgets must be an array",
          field: "widgets",
        },
      ]
    );
  }

  const validWidgets = widgets.filter(isSmartMenuWidget);

  if (validWidgets.length === 0) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "No valid widgets found",
      [{ type: "INSUFFICIENT_DATA" as any, message: "No valid widgets found" }]
    );
  }

  // Calculate basic statistics
  const totalSmartMenus = validWidgets.length;
  const activeSmartMenus = validWidgets.filter((w) => w.publishedAt).length;
  const totalLocations = validWidgets.reduce(
    (sum, w) => sum + (w.numberOfLocations || 0),
    0
  );

  const averageLocationsPerMenu =
    totalSmartMenus > 0 ? totalLocations / totalSmartMenus : 0;

  const activationRate =
    totalSmartMenus > 0 ? (activeSmartMenus / totalSmartMenus) * 100 : 0;

  // Calculate feature usage if analytics provided
  const featureUsage = {
    images: 0,
    cardLayout: 0,
    ordering: 0,
    byo: 0,
  };

  if (analytics && typeof analytics === "object") {
    const totalActive = analytics.totalActive || 0;
    if (totalActive > 0) {
      featureUsage.images = analytics.withImages || 0;
      featureUsage.cardLayout = analytics.withCardLayout || 0;
      featureUsage.ordering = analytics.withOrdering || 0;
      featureUsage.byo = analytics.withByo || 0;
    }
  }

  const result: DashboardSummary = {
    totalSmartMenus,
    activeSmartMenus,
    totalLocations,
    averageLocationsPerMenu,
    activationRate,
    featureUsage,
  };

  return createDashboardCalculationResult(true, result);
}

/**
 * Calculate dashboard performance metrics
 */
export function calculateDashboardPerformance(
  widgets: any[],
  analytics?: any,
  config: DashboardConfig = DEFAULT_DASHBOARD_CONFIG
): DashboardCalculationResult<DashboardPerformance> {
  // Validate input
  if (!Array.isArray(widgets)) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "Widgets must be an array",
      [
        {
          type: "INVALID_DATA" as any,
          message: "Widgets must be an array",
          field: "widgets",
        },
      ]
    );
  }

  const validWidgets = widgets.filter(isSmartMenuWidget);

  if (validWidgets.length === 0) {
    return createDashboardCalculationResult(
      false,
      undefined,
      "No valid widgets found",
      [{ type: "INSUFFICIENT_DATA" as any, message: "No valid widgets found" }]
    );
  }

  // Calculate growth rate
  const _timePeriod = createTimePeriod(config.defaultTimePeriod);
  const currentPeriod = createTimePeriod(config.defaultTimePeriod);
  const previousPeriod = {
    start: subDays(currentPeriod.start, config.defaultTimePeriod),
    end: currentPeriod.start,
    label: `Previous ${config.defaultTimePeriod}-day period`,
    days: config.defaultTimePeriod,
  };

  const currentCreated = filterWidgetsByTimePeriod(
    validWidgets,
    currentPeriod,
    "createdAt"
  ).length;
  const previousCreated = filterWidgetsByTimePeriod(
    validWidgets,
    previousPeriod,
    "createdAt"
  ).length;

  const growthRate =
    previousCreated === 0
      ? currentCreated > 0
        ? 100
        : 0
      : ((currentCreated - previousCreated) / previousCreated) * 100;

  // Calculate activation trend
  const currentActive = filterWidgetsByTimePeriod(
    validWidgets,
    currentPeriod,
    "publishedAt"
  ).length;
  const previousActive = filterWidgetsByTimePeriod(
    validWidgets,
    previousPeriod,
    "publishedAt"
  ).length;
  const activationTrend = calculatePercentageChange(
    currentActive,
    previousActive
  );

  // Calculate location growth
  const currentLocations = filterWidgetsByTimePeriod(
    validWidgets,
    currentPeriod,
    "publishedAt"
  ).reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);
  const previousLocations = filterWidgetsByTimePeriod(
    validWidgets,
    previousPeriod,
    "publishedAt"
  ).reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);

  const locationGrowth =
    previousLocations === 0
      ? currentLocations > 0
        ? 100
        : 0
      : ((currentLocations - previousLocations) / previousLocations) * 100;

  // Calculate feature adoption
  const featureAdoption = {
    images: 0,
    cardLayout: 0,
    ordering: 0,
    byo: 0,
  };

  if (analytics && typeof analytics === "object") {
    const totalActive = analytics.totalActive || 0;
    if (totalActive > 0) {
      featureAdoption.images =
        ((analytics.withImages || 0) / totalActive) * 100;
      featureAdoption.cardLayout =
        ((analytics.withCardLayout || 0) / totalActive) * 100;
      featureAdoption.ordering =
        ((analytics.withOrdering || 0) / totalActive) * 100;
      featureAdoption.byo = ((analytics.withByo || 0) / totalActive) * 100;
    }
  }

  const result: DashboardPerformance = {
    growthRate,
    activationTrend,
    locationGrowth,
    featureAdoption,
  };

  return createDashboardCalculationResult(true, result);
}

/**
 * Convert dashboard metrics result to the format expected by UI components
 */
export function convertToDashboardMetrics(
  result: DashboardMetricsResult
): DashboardMetrics {
  return {
    total: result.total,
    active: result.active,
    totalLocations: result.totalLocations,
    totalDelta: result.trends.total.delta,
    activeDelta: result.trends.active.delta,
    locationsDelta: result.trends.locations.delta,
  };
}
