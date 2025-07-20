import { DocumentNode, gql } from "@apollo/client";
import {
  ORDERS_ANALYTICS,
  WIDGETS_FEATURE_ADOPTION,
  WIDGETS_PERFORMANCE_METRICS,
} from "../../features/dashboard/graphql/lambda/queries/analytics";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface WidgetFeatureAdoption {
  id: string;
  publishedAt?: string | null;
  displayImages: boolean;
  layout: string;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;
}

export interface WidgetPerformanceMetrics {
  id: string;
  publishedAt?: string | null;
  numberOfLocations?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersAnalytics {
  quarter: number;
  year: number;
  quarterLabel: string;
  orders: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface AnalyticsFilters {
  isActive?: boolean;
  isPublished?: boolean;
  layout?: string;
  hasImages?: boolean;
  hasOrderButton?: boolean;
  hasByo?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface FeatureAdoptionMetrics {
  totalWidgets: number;
  withImages: number;
  withOrderButton: number;
  withByo: number;
  byLayout: Record<string, number>;
  adoptionRates: {
    images: number;
    orderButton: number;
    byo: number;
  };
}

export interface PerformanceMetrics {
  totalWidgets: number;
  activeWidgets: number;
  totalLocations: number;
  averageLocations: number;
  recentUpdates: number;
}

/**
 * Analytics Service - Handles analytics-specific queries and business logic
 *
 * This service provides methods for:
 * - Widget feature adoption analytics
 * - Performance metrics analysis
 * - Order analytics and trends
 * - Combined analytics insights
 */
export class AnalyticsService extends DataService<
  WidgetFeatureAdoption,
  AnalyticsFilters
> {
  constructor(config?: DataServiceConfig) {
    super("AnalyticsService", config);
  }

  /**
   * Get feature adoption analytics
   */
  async getFeatureAdoption(): Promise<
    BusinessLogicResult<FeatureAdoptionMetrics>
  > {
    const startTime = Date.now();

    try {
      const result = await this.getAll();
      const widgets = result.data;

      const metrics = this.calculateFeatureAdoptionMetrics(widgets);
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
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<
    BusinessLogicResult<PerformanceMetrics>
  > {
    const document = this.getPerformanceMetricsQuery();

    return this.executeQuery<WidgetPerformanceMetrics[]>(document, undefined, {
      processResult: (data) => this.processPerformanceMetricsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculatePerformanceMetricsMetrics(data, processingTime),
    }).then((result) => {
      const widgets = result.data;
      const metrics = this.calculatePerformanceMetrics(widgets);

      return {
        data: metrics,
        metrics: result.metrics,
      };
    });
  }

  /**
   * Get orders analytics
   */
  async getOrdersAnalytics(): Promise<BusinessLogicResult<OrdersAnalytics[]>> {
    const document = this.getOrdersAnalyticsQuery();

    return this.executeQuery<OrdersAnalytics[]>(document, undefined, {
      processResult: (data) => this.processOrdersAnalyticsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateOrdersAnalyticsMetrics(data, processingTime),
    });
  }

  /**
   * Get widgets by layout type
   */
  async getByLayout(
    layout: string
  ): Promise<BusinessLogicResult<WidgetFeatureAdoption[]>> {
    const filters: AnalyticsFilters = { layout };
    return this.getFiltered(filters);
  }

  /**
   * Get widgets with specific features
   */
  async getWidgetsWithFeature(
    feature: "images" | "orderButton" | "byo"
  ): Promise<BusinessLogicResult<WidgetFeatureAdoption[]>> {
    const filters: AnalyticsFilters = {
      hasImages: feature === "images",
      hasOrderButton: feature === "orderButton",
      hasByo: feature === "byo",
    };
    return this.getFiltered(filters);
  }

  /**
   * Calculate feature adoption metrics
   */
  private calculateFeatureAdoptionMetrics(
    widgets: WidgetFeatureAdoption[]
  ): FeatureAdoptionMetrics {
    const total = widgets.length;
    const withImages = widgets.filter((w) => w.displayImages).length;
    const withOrderButton = widgets.filter(
      (w) => w.isOrderButtonEnabled
    ).length;
    const withByo = widgets.filter((w) => w.isByoEnabled).length;

    // Layout distribution
    const byLayout = widgets.reduce(
      (acc, widget) => {
        acc[widget.layout] = (acc[widget.layout] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate adoption rates
    const adoptionRates = {
      images: total > 0 ? (withImages / total) * 100 : 0,
      orderButton: total > 0 ? (withOrderButton / total) * 100 : 0,
      byo: total > 0 ? (withByo / total) * 100 : 0,
    };

    return {
      totalWidgets: total,
      withImages,
      withOrderButton,
      withByo,
      byLayout,
      adoptionRates,
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    widgets: WidgetPerformanceMetrics[]
  ): PerformanceMetrics {
    const total = widgets.length;
    const active = widgets.filter((w) => Boolean(w.publishedAt)).length;
    const totalLocations = widgets.reduce(
      (sum, w) => sum + (w.numberOfLocations || 0),
      0
    );
    const averageLocations = total > 0 ? totalLocations / total : 0;

    // Count recent updates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUpdates = widgets.filter(
      (w) => new Date(w.updatedAt) > thirtyDaysAgo
    ).length;

    return {
      totalWidgets: total,
      activeWidgets: active,
      totalLocations,
      averageLocations,
      recentUpdates,
    };
  }

  // Override validation methods for analytics-specific validation
  protected validateFilters(filters: AnalyticsFilters): ValidationResult {
    const errors: string[] = [];

    if (filters.layout && typeof filters.layout !== "string") {
      errors.push("Layout must be a string");
    }

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
      filters.hasImages !== undefined &&
      typeof filters.hasImages !== "boolean"
    ) {
      errors.push("hasImages must be a boolean");
    }

    if (
      filters.hasOrderButton !== undefined &&
      typeof filters.hasOrderButton !== "boolean"
    ) {
      errors.push("hasOrderButton must be a boolean");
    }

    if (filters.hasByo !== undefined && typeof filters.hasByo !== "boolean") {
      errors.push("hasByo must be a boolean");
    }

    if (filters.timeRange && typeof filters.timeRange !== "object") {
      errors.push("timeRange must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for analytics-specific processing
  protected processGetAllResult(
    data: WidgetFeatureAdoption[]
  ): WidgetFeatureAdoption[] {
    // Sort by publishedAt (active first), then by id
    return data.sort((a, b) => {
      if (a.publishedAt && !b.publishedAt) return -1;
      if (!a.publishedAt && b.publishedAt) return 1;
      return a.id.localeCompare(b.id);
    });
  }

  protected processFilteredResult(
    data: WidgetFeatureAdoption[]
  ): WidgetFeatureAdoption[] {
    // Apply analytics-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((widget) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processPerformanceMetricsResult(
    data: WidgetPerformanceMetrics[]
  ): WidgetPerformanceMetrics[] {
    return data;
  }

  protected processOrdersAnalyticsResult(
    data: OrdersAnalytics[]
  ): OrdersAnalytics[] {
    // Sort by year and quarter
    return data.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetAnalyticsWidgetById($id: ID!) {
        db_widgetsList {
          items {
            id
            publishedAt
            displayImages
            layout
            isOrderButtonEnabled
            isByoEnabled
          }
        }
      }
    `;
  }

  protected getAllQuery(): DocumentNode {
    return WIDGETS_FEATURE_ADOPTION;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredAnalyticsWidgets($filters: AnalyticsFilters) {
        db_widgetsList(filters: $filters) {
          items {
            id
            publishedAt
            displayImages
            layout
            isOrderButtonEnabled
            isByoEnabled
          }
        }
      }
    `;
  }

  protected getRollupsQuery(): DocumentNode {
    return gql`
      query GetAnalyticsRollups($groupBy: [String!]!) {
        analyticsRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetAnalyticsTrends($timeRange: TimeRange!) {
        analyticsTrends(timeRange: $timeRange) {
          period
          total
          active
          features
          performance
        }
      }
    `;
  }

  protected getPerformanceMetricsQuery(): DocumentNode {
    return WIDGETS_PERFORMANCE_METRICS;
  }

  protected getOrdersAnalyticsQuery(): DocumentNode {
    return ORDERS_ANALYTICS;
  }

  // Enhanced metrics calculation for analytics
  protected calculateGetAllMetrics(
    data: WidgetFeatureAdoption[],
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
    data: WidgetFeatureAdoption[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculatePerformanceMetricsMetrics(
    data: WidgetPerformanceMetrics[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateOrdersAnalyticsMetrics(
    data: OrdersAnalytics[],
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
