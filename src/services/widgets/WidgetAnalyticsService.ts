import { DocumentNode, gql } from "@apollo/client";
import { isAfter, subDays } from "date-fns";
import { WIDGET_ANALYTICS_FIELDS } from "../../features/smartMenus/graphql/fragments";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface WidgetAnalytics {
  id: string;
  publishedAt?: string | null;
  displayImages: boolean;
  layout: string;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;
}

export interface WidgetDashboard {
  id: string;
  name: string;
  isActive: boolean;
  isSyncEnabled: boolean;
  lastSyncedAt: string;
  publishedAt?: string | null;
  updatedAt: string;
}

export interface WidgetFilters {
  isActive?: boolean;
  isPublished?: boolean;
  layout?: string;
  hasImages?: boolean;
  hasOrderButton?: boolean;
  hasByo?: boolean;
}

export interface WidgetMetrics {
  total: number;
  active: number;
  totalLocations: number;
  totalDelta: string;
  activeDelta: string;
  locationsDelta: string;
  withImages: number;
  withOrderButton: number;
  withByo: number;
  byLayout: Record<string, number>;
}

export interface WidgetTrends {
  period: string;
  total: number;
  active: number;
  locations: number;
  newWidgets: number;
}

/**
 * Widget Analytics Service - Handles widget-specific analytics and business logic
 *
 * This service provides methods for:
 * - Widget analytics data retrieval and processing
 * - Dashboard metrics calculations
 * - Trend analysis and reporting
 * - Widget filtering and search
 */
export class WidgetAnalyticsService extends DataService<
  WidgetAnalytics,
  WidgetFilters
> {
  constructor(config?: DataServiceConfig) {
    super("WidgetAnalyticsService", config);
  }

  /**
   * Get comprehensive widget analytics for dashboard
   */
  async getDashboardAnalytics(): Promise<BusinessLogicResult<WidgetMetrics>> {
    const startTime = Date.now();

    try {
      // Get all widgets for analytics
      const result = await this.getAll();

      const widgets = result.data;
      const metrics = this.calculateDashboardMetrics(widgets);
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
   * Get widget trends over time
   */
  async getWidgetTrends(timeRange: {
    start: Date;
    end: Date;
  }): Promise<BusinessLogicResult<WidgetTrends[]>> {
    const document = this.getTrendsQuery();
    const variables = { timeRange };

    return this.executeQuery<WidgetTrends[]>(document, variables, {
      validateInput: (vars) => this.validateTimeRange(vars.timeRange),
      processResult: (data) => this.processWidgetTrendsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateWidgetTrendsMetrics(data, processingTime),
    });
  }

  /**
   * Get widgets by layout type
   */
  async getByLayout(
    layout: string
  ): Promise<BusinessLogicResult<WidgetAnalytics[]>> {
    const filters: WidgetFilters = { layout };
    return this.getFiltered(filters);
  }

  /**
   * Get active widgets only
   */
  async getActiveWidgets(): Promise<BusinessLogicResult<WidgetAnalytics[]>> {
    const filters: WidgetFilters = { isPublished: true };
    return this.getFiltered(filters);
  }

  /**
   * Get widgets with specific features
   */
  async getWidgetsWithFeature(
    feature: "images" | "orderButton" | "byo"
  ): Promise<BusinessLogicResult<WidgetAnalytics[]>> {
    const filters: WidgetFilters = {
      hasImages: feature === "images",
      hasOrderButton: feature === "orderButton",
      hasByo: feature === "byo",
    };
    return this.getFiltered(filters);
  }

  /**
   * Calculate comprehensive dashboard metrics
   */
  private calculateDashboardMetrics(widgets: WidgetAnalytics[]): WidgetMetrics {
    const total = widgets.length;
    const active = widgets.filter((w) => Boolean(w.publishedAt)).length;

    // Feature usage counts
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

    // Calculate trends (30-day periods)
    const now = new Date();
    const startCurrent = subDays(now, 30);
    const startPrev = subDays(startCurrent, 30);

    const createdCurr = widgets.filter((w) =>
      isAfter(new Date(w.publishedAt || w.id), startCurrent)
    ).length;
    const createdPrev = widgets.filter(
      (w) =>
        isAfter(new Date(w.publishedAt || w.id), startPrev) &&
        !isAfter(new Date(w.publishedAt || w.id), startCurrent)
    ).length;

    const activeCurr = widgets.filter(
      (w) => w.publishedAt && isAfter(new Date(w.publishedAt), startCurrent)
    ).length;
    const activePrev = widgets.filter(
      (w) =>
        w.publishedAt &&
        isAfter(new Date(w.publishedAt), startPrev) &&
        !isAfter(new Date(w.publishedAt), startCurrent)
    ).length;

    const pct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const v = ((curr - prev) / prev) * 100;
      return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
    };

    return {
      total,
      active,
      totalLocations: 0, // Would need location data from separate query
      totalDelta: pct(createdCurr, createdPrev),
      activeDelta: pct(activeCurr, activePrev),
      locationsDelta: "0%", // Would need location trend data
      withImages,
      withOrderButton,
      withByo,
      byLayout,
    };
  }

  // Override validation methods for widget-specific validation
  protected validateFilters(filters: WidgetFilters): ValidationResult {
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

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for widget-specific processing
  protected processGetAllResult(data: WidgetAnalytics[]): WidgetAnalytics[] {
    // Sort by publishedAt (active first), then by id
    return data.sort((a, b) => {
      if (a.publishedAt && !b.publishedAt) return -1;
      if (!a.publishedAt && b.publishedAt) return 1;
      return a.id.localeCompare(b.id);
    });
  }

  protected processFilteredResult(data: WidgetAnalytics[]): WidgetAnalytics[] {
    // Apply widget-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((widget) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processWidgetTrendsResult(data: WidgetTrends[]): WidgetTrends[] {
    return data;
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetWidgetById($id: ID!) {
        widget(id: $id) {
          ...WidgetAnalyticsFields
        }
      }
      ${WIDGET_ANALYTICS_FIELDS}
    `;
  }

  protected getAllQuery(): DocumentNode {
    return gql`
      query GetAllWidgetsAnalytics {
        widgets {
          ...WidgetAnalyticsFields
        }
      }
      ${WIDGET_ANALYTICS_FIELDS}
    `;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredWidgets($filters: WidgetFilters) {
        widgets(filters: $filters) {
          ...WidgetAnalyticsFields
        }
      }
      ${WIDGET_ANALYTICS_FIELDS}
    `;
  }

  protected getRollupsQuery(): DocumentNode {
    return gql`
      query GetWidgetRollups($groupBy: [String!]!) {
        widgetRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetWidgetTrends($timeRange: TimeRange!) {
        widgetTrends(timeRange: $timeRange) {
          period
          total
          active
          locations
          newWidgets
        }
      }
    `;
  }

  // Enhanced metrics calculation for widgets
  protected calculateGetAllMetrics(
    data: WidgetAnalytics[],
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
    data: WidgetAnalytics[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateWidgetTrendsMetrics(
    data: WidgetTrends[],
    processingTime: number
  ): MetricsData {
    const totalWidgets = data.reduce((sum, trend) => sum + trend.total, 0);

    return {
      totalCount: data.length,
      filteredCount: totalWidgets,
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
