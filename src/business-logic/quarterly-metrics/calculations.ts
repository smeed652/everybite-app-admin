/**
 * Business Logic: Quarterly Metrics Calculations
 *
 * Pure functions for calculating quarterly metrics and analytics.
 * These functions are UI-independent and can be tested separately.
 */

import { BusinessLogicResult, GrowthMetrics } from "../types";
import { QuarterlyMetricInput, QuarterlyMetricOutput } from "./transformers";

/**
 * Calculate growth metrics between two values
 */
export function calculateGrowthMetrics(
  current: number,
  previous: number
): GrowthMetrics {
  const growth = current - previous;
  const growthPercent =
    previous === 0 ? (current > 0 ? 100 : 0) : (growth / previous) * 100;

  return {
    current,
    previous,
    growth,
    growthPercent,
    isPositive: growth >= 0,
  };
}

/**
 * Calculate total orders across all quarters
 */
export function calculateTotalOrders(
  quarterlyData: QuarterlyMetricOutput[]
): number {
  return quarterlyData.reduce((sum, quarter) => sum + quarter.orders, 0);
}

/**
 * Calculate total revenue across all quarters
 */
export function calculateTotalRevenue(
  quarterlyData: QuarterlyMetricInput[]
): number {
  return quarterlyData.reduce((sum, quarter) => {
    return sum + (quarter.totalRevenue?.amount || 0);
  }, 0);
}

/**
 * Calculate average orders per quarter
 */
export function calculateAverageOrdersPerQuarter(
  quarterlyData: QuarterlyMetricOutput[]
): number {
  if (quarterlyData.length === 0) return 0;
  return calculateTotalOrders(quarterlyData) / quarterlyData.length;
}

/**
 * Calculate orders delta (growth percentage) between current and previous quarter
 */
export function calculateOrdersDelta(
  quarterlyData: QuarterlyMetricOutput[]
): string {
  if (quarterlyData.length === 0) {
    return "0%";
  }

  const currentQuarter = quarterlyData[0];
  const previousQuarter = quarterlyData[1];

  if (!currentQuarter?.orders) {
    return "0%";
  }

  if (!previousQuarter?.orders) {
    return currentQuarter.orders > 0 ? "+100%" : "0%";
  }

  const growth = currentQuarter.ordersQoQGrowth || 0;
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
}

/**
 * Calculate total brands across all quarters
 */
export function calculateTotalBrands(
  quarterlyData: QuarterlyMetricOutput[]
): number {
  return quarterlyData.reduce((sum, quarter) => sum + quarter.brands, 0);
}

/**
 * Calculate total locations across all quarters
 */
export function calculateTotalLocations(
  quarterlyData: QuarterlyMetricOutput[]
): number {
  return quarterlyData.reduce((sum, quarter) => sum + quarter.locations, 0);
}

/**
 * Calculate total active smart menus across all quarters
 */
export function calculateTotalActiveSmartMenus(
  quarterlyData: QuarterlyMetricOutput[]
): number {
  return quarterlyData.reduce(
    (sum, quarter) => sum + quarter.activeSmartMenus,
    0
  );
}

/**
 * Calculate growth rate for a specific metric
 */
export function calculateMetricGrowthRate(
  quarterlyData: QuarterlyMetricOutput[],
  metric: keyof Omit<QuarterlyMetricOutput, "quarter">
): number {
  if (quarterlyData.length < 2) return 0;

  const current = quarterlyData[0][metric];
  const previous = quarterlyData[1][metric];

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Calculate compound annual growth rate (CAGR)
 */
export function calculateCAGR(
  quarterlyData: QuarterlyMetricOutput[],
  metric: keyof Omit<QuarterlyMetricOutput, "quarter">,
  years: number = 1
): number {
  if (quarterlyData.length === 0 || years <= 0) return 0;

  const firstValue = quarterlyData[quarterlyData.length - 1][metric];
  const lastValue = quarterlyData[0][metric];

  if (firstValue === 0) return 0;

  const growthRate = Math.pow(lastValue / firstValue, 1 / years) - 1;
  return growthRate * 100;
}

/**
 * Calculate trend direction for a metric
 */
export function calculateTrendDirection(
  quarterlyData: QuarterlyMetricOutput[],
  metric: keyof Omit<QuarterlyMetricOutput, "quarter">
): "increasing" | "decreasing" | "stable" {
  if (quarterlyData.length < 2) return "stable";

  const recent = quarterlyData.slice(0, 3); // Last 3 quarters
  const values = recent.map((q) => q[metric]);

  // Calculate trend using linear regression (simplified)
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (Math.abs(slope) < 0.01) return "stable";
  return slope > 0 ? "increasing" : "decreasing";
}

/**
 * Calculate quarter-over-quarter growth for all metrics
 */
export function calculateQoQGrowth(
  quarterlyData: QuarterlyMetricOutput[]
): BusinessLogicResult<Record<string, number>> {
  if (quarterlyData.length < 2) {
    return {
      success: false,
      error: "Insufficient data for QoQ calculation",
    };
  }

  const metrics: (keyof Omit<QuarterlyMetricOutput, "quarter">)[] = [
    "brands",
    "locations",
    "activeSmartMenus",
    "orders",
  ];

  const growth: Record<string, number> = {};

  metrics.forEach((metric) => {
    growth[metric] = calculateMetricGrowthRate(quarterlyData, metric);
  });

  return {
    success: true,
    data: growth,
  };
}

/**
 * Calculate year-over-year growth for all metrics
 */
export function calculateYoYGrowth(
  quarterlyData: QuarterlyMetricOutput[]
): BusinessLogicResult<Record<string, number>> {
  if (quarterlyData.length < 4) {
    return {
      success: false,
      error: "Insufficient data for YoY calculation (need at least 4 quarters)",
    };
  }

  const metrics: (keyof Omit<QuarterlyMetricOutput, "quarter">)[] = [
    "brands",
    "locations",
    "activeSmartMenus",
    "orders",
  ];

  const growth: Record<string, number> = {};

  metrics.forEach((metric) => {
    const current = quarterlyData[0][metric];
    const previous = quarterlyData[4][metric]; // 4 quarters ago

    if (previous === 0) {
      growth[metric] = current > 0 ? 100 : 0;
    } else {
      growth[metric] = ((current - previous) / previous) * 100;
    }
  });

  return {
    success: true,
    data: growth,
  };
}

/**
 * Calculate summary statistics for quarterly data
 */
export function calculateSummaryStatistics(
  quarterlyData: QuarterlyMetricOutput[]
): BusinessLogicResult<{
  totalOrders: number;
  totalBrands: number;
  totalLocations: number;
  totalActiveSmartMenus: number;
  averageOrdersPerQuarter: number;
  qoqGrowth: Record<string, number>;
  trendDirections: Record<string, "increasing" | "decreasing" | "stable">;
}> {
  if (quarterlyData.length === 0) {
    return {
      success: false,
      error: "No quarterly data provided",
    };
  }

  const totalOrders = calculateTotalOrders(quarterlyData);
  const totalBrands = calculateTotalBrands(quarterlyData);
  const totalLocations = calculateTotalLocations(quarterlyData);
  const totalActiveSmartMenus = calculateTotalActiveSmartMenus(quarterlyData);
  const averageOrdersPerQuarter =
    calculateAverageOrdersPerQuarter(quarterlyData);

  const qoqGrowthResult = calculateQoQGrowth(quarterlyData);
  const qoqGrowth = qoqGrowthResult.success ? qoqGrowthResult.data! : {};

  const metrics: (keyof Omit<QuarterlyMetricOutput, "quarter">)[] = [
    "brands",
    "locations",
    "activeSmartMenus",
    "orders",
  ];

  const trendDirections: Record<
    string,
    "increasing" | "decreasing" | "stable"
  > = {};
  metrics.forEach((metric) => {
    trendDirections[metric] = calculateTrendDirection(quarterlyData, metric);
  });

  return {
    success: true,
    data: {
      totalOrders,
      totalBrands,
      totalLocations,
      totalActiveSmartMenus,
      averageOrdersPerQuarter,
      qoqGrowth,
      trendDirections,
    },
  };
}
