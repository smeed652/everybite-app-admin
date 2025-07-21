/**
 * Business Logic: Quarterly Metrics Data Transformation
 *
 * Pure functions for transforming quarterly metrics data.
 * These functions are UI-independent and can be tested separately.
 */

export interface QuarterlyMetricInput {
  quarterLabel: string;
  brands?: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  locations?: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  orders?: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  activeSmartMenus?: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  totalRevenue?: {
    amount: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface QuarterlyMetricOutput {
  quarter: string;
  brands: number;
  locations: number;
  activeSmartMenus: number;
  orders: number;
  ordersQoQGrowth: number;
}

/**
 * Transform quarterly metrics data for UI consumption
 *
 * This function handles data structure mismatches and provides fallbacks
 * for missing fields, ensuring the UI always receives consistent data.
 */
export function transformQuarterlyData(
  quarterlyMetrics: QuarterlyMetricInput[] | null | undefined
): QuarterlyMetricOutput[] {
  if (!quarterlyMetrics || !Array.isArray(quarterlyMetrics)) {
    return [];
  }

  return quarterlyMetrics.map((item) => ({
    quarter: item.quarterLabel || "Unknown Quarter",
    brands:
      Number(item.brands?.count) || Number(item.activeSmartMenus?.count) || 0,
    locations: Number(item.locations?.count) || 0,
    activeSmartMenus: Number(item.activeSmartMenus?.count) || 0,
    orders: Number(item.orders?.count) || 0,
    ordersQoQGrowth: Number(item.orders?.qoqGrowthPercent) || 0,
  }));
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

  // If there's no previous quarter, use the ordersQoQGrowth value if available
  if (!previousQuarter?.orders) {
    if (currentQuarter.ordersQoQGrowth !== undefined) {
      const growth = currentQuarter.ordersQoQGrowth;
      return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
    }
    return currentQuarter.orders > 0 ? "+100%" : "0%";
  }

  // Use the ordersQoQGrowth value from the transformed data
  const growth = currentQuarter.ordersQoQGrowth || 0;
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
}

/**
 * Validate quarterly metrics data structure
 */
export function validateQuarterlyMetrics(quarterlyMetrics: any[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  quarterlyMetrics.forEach((item, index) => {
    if (!item.quarterLabel) {
      errors.push(`Item ${index}: Missing quarterLabel`);
    }

    if (item.orders && typeof item.orders.count !== "number") {
      errors.push(`Item ${index}: orders.count must be a number`);
    }

    if (item.locations && typeof item.locations.count !== "number") {
      errors.push(`Item ${index}: locations.count must be a number`);
    }

    if (
      item.activeSmartMenus &&
      typeof item.activeSmartMenus.count !== "number"
    ) {
      errors.push(`Item ${index}: activeSmartMenus.count must be a number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
