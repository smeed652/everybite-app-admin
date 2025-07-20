import { DocumentNode, gql } from "@apollo/client";
import {
  DASHBOARD_LOCATION_METRICS,
  DASHBOARD_ORDER_METRICS,
  DASHBOARD_WIDGET_METRICS,
} from "../../features/dashboard/graphql/lambda/queries/dashboard";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface DashboardWidgetMetrics {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number;
}

export interface DashboardOrderMetrics {
  count: number;
  qoqGrowth: number;
  qoqGrowthPercent: number;
}

export interface DashboardLocationMetrics {
  id: string;
  publishedAt?: string | null;
  numberOfLocations?: number;
}

export interface DashboardFilters {
  isActive?: boolean;
  isPublished?: boolean;
  hasLocations?: boolean;
}

export interface DashboardMetrics {
  totalWidgets: number;
  activeWidgets: number;
  totalLocations: number;
  totalOrders: number;
  ordersGrowth: number;
  ordersGrowthPercent: number;
}

/**
 * Dashboard Service - Handles dashboard-specific metrics and analytics
 *
 * This service provides methods for:
 * - Dashboard widget metrics
 * - Order metrics and trends
 * - Location metrics
 * - Combined dashboard analytics
 */
export class DashboardService extends DataService<
  DashboardWidgetMetrics,
  DashboardFilters
> {
  constructor(config?: DataServiceConfig) {
    super("DashboardService", config);
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(): Promise<BusinessLogicResult<DashboardMetrics>> {
    const startTime = Date.now();

    try {
      // Get all dashboard data
      const [widgetsResult, ordersResult, locationsResult] = await Promise.all([
        this.getAll(),
        this.getOrderMetrics(),
        this.getLocationMetrics(),
      ]);

      const widgets = widgetsResult.data;
      const orders = ordersResult.data;
      const locations = locationsResult.data;

      // Calculate combined metrics
      const metrics: DashboardMetrics = {
        totalWidgets: widgets.length,
        activeWidgets: widgets.filter((w) => Boolean(w.publishedAt)).length,
        totalLocations: locations.reduce(
          (sum, l) => sum + (l.numberOfLocations || 0),
          0
        ),
        totalOrders: orders.count,
        ordersGrowth: orders.qoqGrowth,
        ordersGrowthPercent: orders.qoqGrowthPercent,
      };

      const processingTime = Date.now() - startTime;

      return {
        data: metrics,
        metrics: {
          totalCount: widgets.length,
          filteredCount: widgets.length,
          processingTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get order metrics
   */
  async getOrderMetrics(): Promise<BusinessLogicResult<DashboardOrderMetrics>> {
    const document = this.getOrderMetricsQuery();

    return this.executeQuery<DashboardOrderMetrics>(document, undefined, {
      processResult: (data) => this.processOrderMetricsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateOrderMetricsMetrics(data, processingTime),
    });
  }

  /**
   * Get location metrics
   */
  async getLocationMetrics(): Promise<
    BusinessLogicResult<DashboardLocationMetrics[]>
  > {
    const document = this.getLocationMetricsQuery();

    return this.executeQuery<DashboardLocationMetrics[]>(document, undefined, {
      processResult: (data) => this.processLocationMetricsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateLocationMetricsMetrics(data, processingTime),
    });
  }

  /**
   * Get active widgets only
   */
  async getActiveWidgets(): Promise<
    BusinessLogicResult<DashboardWidgetMetrics[]>
  > {
    const filters: DashboardFilters = { isPublished: true };
    return this.getFiltered(filters);
  }

  /**
   * Get widgets with locations
   */
  async getWidgetsWithLocations(): Promise<
    BusinessLogicResult<DashboardWidgetMetrics[]>
  > {
    const filters: DashboardFilters = { hasLocations: true };
    return this.getFiltered(filters);
  }

  // Override validation methods for dashboard-specific validation
  protected validateFilters(filters: DashboardFilters): ValidationResult {
    const errors: string[] = [];

    if (
      filters.isActive !== undefined &&
      typeof filters.isActive !== "boolean"
    ) {
      errors.push("isActive must be a boolean");
    }

    if (
      filters.isPublished !== undefined &&
      typeof filters.isPublished !== "boolean"
    ) {
      errors.push("isPublished must be a boolean");
    }

    if (
      filters.hasLocations !== undefined &&
      typeof filters.hasLocations !== "boolean"
    ) {
      errors.push("hasLocations must be a boolean");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for dashboard-specific processing
  protected processGetAllResult(
    data: DashboardWidgetMetrics[]
  ): DashboardWidgetMetrics[] {
    // Sort by publishedAt (active first), then by createdAt
    return data.sort((a, b) => {
      if (a.publishedAt && !b.publishedAt) return -1;
      if (!a.publishedAt && b.publishedAt) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  protected processFilteredResult(
    data: DashboardWidgetMetrics[]
  ): DashboardWidgetMetrics[] {
    // Apply dashboard-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((widget) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processOrderMetricsResult(
    data: DashboardOrderMetrics
  ): DashboardOrderMetrics {
    return data;
  }

  protected processLocationMetricsResult(
    data: DashboardLocationMetrics[]
  ): DashboardLocationMetrics[] {
    return data;
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetDashboardWidgetById($id: ID!) {
        db_widgetsList {
          items {
            id
            createdAt
            publishedAt
            numberOfLocations
          }
        }
      }
    `;
  }

  protected getAllQuery(): DocumentNode {
    return DASHBOARD_WIDGET_METRICS;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredDashboardWidgets($filters: DashboardFilters) {
        db_widgetsList(filters: $filters) {
          items {
            id
            createdAt
            publishedAt
            numberOfLocations
          }
        }
      }
    `;
  }

  protected getRollupsQuery(): DocumentNode {
    return gql`
      query GetDashboardRollups($groupBy: [String!]!) {
        dashboardRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetDashboardTrends($timeRange: TimeRange!) {
        dashboardTrends(timeRange: $timeRange) {
          period
          total
          active
          locations
          orders
        }
      }
    `;
  }

  protected getOrderMetricsQuery(): DocumentNode {
    return DASHBOARD_ORDER_METRICS;
  }

  protected getLocationMetricsQuery(): DocumentNode {
    return DASHBOARD_LOCATION_METRICS;
  }

  // Enhanced metrics calculation for dashboard
  protected calculateGetAllMetrics(
    data: DashboardWidgetMetrics[],
    processingTime: number
  ): MetricsData {
    const activeCount = data.filter((w) => Boolean(w.publishedAt)).length;

    return {
      totalCount: data.length,
      filteredCount: activeCount,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateFilteredMetrics(
    data: DashboardWidgetMetrics[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateOrderMetricsMetrics(
    data: DashboardOrderMetrics,
    processingTime: number
  ): MetricsData {
    return {
      totalCount: 1,
      filteredCount: 1,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateLocationMetricsMetrics(
    data: DashboardLocationMetrics[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateTrendsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateRollupsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }
}
