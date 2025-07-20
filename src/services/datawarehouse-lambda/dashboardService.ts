import {
  LAMBDA_GET_DASHBOARD_WIDGETS,
  LAMBDA_GET_PLAYER_ANALYTICS,
  LAMBDA_GET_QUARTERLY_METRICS,
} from "../../features/dashboard/graphql/lambda/queries";
import { lambdaService } from "../base/lambdaService";

// Define types for Lambda responses since they're not in generated GraphQL
export interface QuarterlyMetricsData {
  quarterlyMetrics: Array<{
    quarter: string;
    year: number;
    quarterLabel: string;
    orders: {
      count: number;
      qoqGrowth: number;
      qoqGrowthPercent: number;
    };
    locations: {
      count: number;
      qoqGrowth: number;
      qoqGrowthPercent: number;
    };
    activeSmartMenus: {
      count: number;
      qoqGrowth: number;
      qoqGrowthPercent: number;
    };
    brands: {
      count: number;
      qoqGrowth: number;
      qoqGrowthPercent: number;
    };
    totalRevenue: {
      amount: number;
      qoqGrowth: number;
      qoqGrowthPercent: number;
    };
  }>;
}

export interface DashboardWidgetsData {
  db_widgetsList: {
    items: Array<{
      id: string;
      createdAt: string;
      publishedAt: string | null;
      numberOfLocations: number;
    }>;
    pagination: {
      total: number;
    };
  };
}

export interface PlayerAnalyticsData {
  db_widgetsList: {
    items: Array<{
      id: string;
      publishedAt: string | null;
      displayImages: boolean;
      layout: string;
      isOrderButtonEnabled: boolean;
      isByoEnabled: boolean;
    }>;
  };
}

// Dashboard operation names for cache management
const DASHBOARD_OPERATIONS = [
  "GetQuarterlyMetrics",
  "GetDashboardWidgets",
  "GetPlayerAnalytics",
];

/**
 * Dashboard Service - Domain-specific service for dashboard data
 *
 * This service can be extracted into a separate npm package:
 * @example
 * ```bash
 * npm install @everybite/dashboard-service
 * ```
 *
 * @example
 * ```typescript
 * import { dashboardService } from '@everybite/dashboard-service';
 *
 * const metrics = await dashboardService.getQuarterlyMetrics();
 * const analytics = await dashboardService.getWidgetAnalytics();
 * ```
 */
export const dashboardService = {
  /**
   * Get quarterly metrics data
   */
  getQuarterlyMetrics: () =>
    lambdaService.query<QuarterlyMetricsData>(LAMBDA_GET_QUARTERLY_METRICS),

  /**
   * Get widget analytics data
   */
  getWidgetAnalytics: () =>
    lambdaService.query<DashboardWidgetsData>(LAMBDA_GET_DASHBOARD_WIDGETS),

  /**
   * Get player analytics data
   */
  getPlayerAnalytics: () =>
    lambdaService.query<PlayerAnalyticsData>(LAMBDA_GET_PLAYER_ANALYTICS),

  /**
   * Prefetch all dashboard data in parallel
   * This is useful for initial page load or cache warming
   */
  prefetchDashboardData: async () => {
    return lambdaService.prefetch<{
      quarterly: QuarterlyMetricsData;
      widgets: DashboardWidgetsData;
      analytics: PlayerAnalyticsData;
    }>([
      { key: "quarterly", document: LAMBDA_GET_QUARTERLY_METRICS },
      { key: "widgets", document: LAMBDA_GET_DASHBOARD_WIDGETS },
      { key: "analytics", document: LAMBDA_GET_PLAYER_ANALYTICS },
    ]);
  },

  /**
   * Clear cache for all dashboard operations
   */
  clearDashboardCache: () => {
    lambdaService.clearOperationsCache(DASHBOARD_OPERATIONS);
  },

  /**
   * Clear cache for specific dashboard operation
   */
  clearOperationCache: (operationName: string) => {
    lambdaService.clearOperationCache(operationName);
  },

  /**
   * Get cache status for all dashboard operations
   */
  getDashboardCacheStatus: () => {
    return DASHBOARD_OPERATIONS.map((operation) =>
      lambdaService.getOperationCacheStatus(operation)
    );
  },

  /**
   * Get cache status for specific dashboard operation
   */
  getOperationCacheStatus: (operationName: string) => {
    return lambdaService.getOperationCacheStatus(operationName);
  },

  /**
   * Refresh specific dashboard operation (clear cache and refetch)
   */
  refreshOperation: async (operationName: string) => {
    lambdaService.clearOperationCache(operationName);

    // Refetch based on operation name
    switch (operationName) {
      case "GetQuarterlyMetrics":
        return await dashboardService.getQuarterlyMetrics();
      case "GetDashboardWidgets":
        return await dashboardService.getWidgetAnalytics();
      case "GetPlayerAnalytics":
        return await dashboardService.getPlayerAnalytics();
      default:
        throw new Error(`Unknown dashboard operation: ${operationName}`);
    }
  },

  /**
   * Refresh all dashboard data (clear cache and refetch)
   */
  refreshAllDashboardData: async () => {
    lambdaService.clearOperationsCache(DASHBOARD_OPERATIONS);
    return await dashboardService.prefetchDashboardData();
  },

  /**
   * Clear Apollo cache
   */
  clearCache: () => lambdaService.clearCache(),

  /**
   * Reset Apollo cache
   */
  resetCache: () => lambdaService.resetCache(),
};

/**
 * Create a dashboard service with custom configuration
 * Useful for different environments or testing
 */
export const createDashboardService = (
  config: Parameters<typeof lambdaService.query>[2]
) => ({
  getQuarterlyMetrics: () =>
    lambdaService.query<QuarterlyMetricsData>(
      LAMBDA_GET_QUARTERLY_METRICS,
      undefined,
      config
    ),

  getWidgetAnalytics: () =>
    lambdaService.query<DashboardWidgetsData>(
      LAMBDA_GET_DASHBOARD_WIDGETS,
      undefined,
      config
    ),

  getPlayerAnalytics: () =>
    lambdaService.query<PlayerAnalyticsData>(
      LAMBDA_GET_PLAYER_ANALYTICS,
      undefined,
      config
    ),

  prefetchDashboardData: async () => {
    return lambdaService.prefetch<{
      quarterly: QuarterlyMetricsData;
      widgets: DashboardWidgetsData;
      analytics: PlayerAnalyticsData;
    }>(
      [
        { key: "quarterly", document: LAMBDA_GET_QUARTERLY_METRICS },
        { key: "widgets", document: LAMBDA_GET_DASHBOARD_WIDGETS },
        { key: "analytics", document: LAMBDA_GET_PLAYER_ANALYTICS },
      ],
      config
    );
  },

  clearDashboardCache: () => {
    lambdaService.clearOperationsCache(DASHBOARD_OPERATIONS);
  },

  clearOperationCache: (operationName: string) => {
    lambdaService.clearOperationCache(operationName);
  },

  getDashboardCacheStatus: () => {
    return DASHBOARD_OPERATIONS.map((operation) =>
      lambdaService.getOperationCacheStatus(operation)
    );
  },

  getOperationCacheStatus: (operationName: string) => {
    return lambdaService.getOperationCacheStatus(operationName);
  },

  refreshOperation: async (operationName: string) => {
    lambdaService.clearOperationCache(operationName);

    switch (operationName) {
      case "GetQuarterlyMetrics":
        return await lambdaService.query<QuarterlyMetricsData>(
          LAMBDA_GET_QUARTERLY_METRICS,
          undefined,
          config
        );
      case "GetDashboardWidgets":
        return await lambdaService.query<DashboardWidgetsData>(
          LAMBDA_GET_DASHBOARD_WIDGETS,
          undefined,
          config
        );
      case "GetPlayerAnalytics":
        return await lambdaService.query<PlayerAnalyticsData>(
          LAMBDA_GET_PLAYER_ANALYTICS,
          undefined,
          config
        );
      default:
        throw new Error(`Unknown dashboard operation: ${operationName}`);
    }
  },

  refreshAllDashboardData: async () => {
    lambdaService.clearOperationsCache(DASHBOARD_OPERATIONS);
    return await lambdaService.prefetch<{
      quarterly: QuarterlyMetricsData;
      widgets: DashboardWidgetsData;
      analytics: PlayerAnalyticsData;
    }>(
      [
        { key: "quarterly", document: LAMBDA_GET_QUARTERLY_METRICS },
        { key: "widgets", document: LAMBDA_GET_DASHBOARD_WIDGETS },
        { key: "analytics", document: LAMBDA_GET_PLAYER_ANALYTICS },
      ],
      config
    );
  },

  clearCache: () => lambdaService.clearCache(config),
  resetCache: () => lambdaService.resetCache(config),
});

// Export dashboard operation names for external use
export { DASHBOARD_OPERATIONS };
