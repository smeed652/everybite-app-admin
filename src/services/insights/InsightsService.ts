import { DocumentNode, gql } from "@apollo/client";
import {
  PREDICTIVE_INSIGHTS,
  WIDGETS_ACTIVATION_INSIGHTS,
  WIDGETS_RETENTION_ANALYTICS,
} from "../../features/dashboard/graphql/lambda/queries/insights";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface WidgetActivationInsights {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number;
}

export interface WidgetRetentionAnalytics {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt: string;
  numberOfLocations?: number;
}

export interface PredictiveInsights {
  quarter: number;
  year: number;
  quarterLabel: string;
  activeSmartMenus: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  orders: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface InsightsFilters {
  timeRange?: {
    start: Date;
    end: Date;
  };
  insightType?: "activation" | "retention" | "predictive";
  quarter?: number;
  year?: number;
}

export interface ActivationInsightsMetrics {
  totalWidgets: number;
  activatedWidgets: number;
  activationRate: number;
  totalLocations: number;
  averageLocations: number;
  activationTrend: {
    recent: number;
    previous: number;
    growth: number;
  };
}

export interface RetentionAnalyticsMetrics {
  totalWidgets: number;
  retainedWidgets: number;
  retentionRate: number;
  averageLifespan: number;
  recentUpdates: number;
  retentionTrend: {
    recent: number;
    previous: number;
    change: number;
  };
}

export interface PredictiveInsightsMetrics {
  totalQuarters: number;
  predictedGrowth: {
    smartMenus: number;
    orders: number;
  };
  confidence: {
    smartMenus: number;
    orders: number;
  };
  trends: PredictiveInsights[];
}

/**
 * Insights Service - Handles insights-specific queries and business logic
 *
 * This service provides methods for:
 * - Widget activation insights
 * - Retention analytics
 * - Predictive insights
 * - Combined business intelligence
 */
export class InsightsService extends DataService<
  WidgetActivationInsights,
  InsightsFilters
> {
  constructor(config?: DataServiceConfig) {
    super("InsightsService", config);
  }

  /**
   * Get activation insights
   */
  async getActivationInsights(): Promise<
    BusinessLogicResult<ActivationInsightsMetrics>
  > {
    const startTime = Date.now();

    try {
      const result = await this.getAll();
      const widgets = result.data;

      const metrics = this.calculateActivationInsightsMetrics(widgets);
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
   * Get retention analytics
   */
  async getRetentionAnalytics(): Promise<
    BusinessLogicResult<RetentionAnalyticsMetrics>
  > {
    const document = this.getRetentionAnalyticsQuery();

    return this.executeQuery<WidgetRetentionAnalytics[]>(document, undefined, {
      processResult: (data) => this.processRetentionAnalyticsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateRetentionAnalyticsMetrics(data, processingTime),
    }).then((result) => {
      const widgets = result.data;
      const metrics = this.calculateRetentionAnalyticsMetrics(widgets);

      return {
        data: metrics,
        metrics: result.metrics,
      };
    });
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights(): Promise<
    BusinessLogicResult<PredictiveInsightsMetrics>
  > {
    const document = this.getPredictiveInsightsQuery();

    return this.executeQuery<PredictiveInsights[]>(document, undefined, {
      processResult: (data) => this.processPredictiveInsightsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculatePredictiveInsightsMetrics(data, processingTime),
    }).then((result) => {
      const insights = result.data;
      const metrics = this.calculatePredictiveInsightsMetrics(insights);

      return {
        data: metrics,
        metrics: result.metrics,
      };
    });
  }

  /**
   * Get insights by time range
   */
  async getInsightsByTimeRange(timeRange: {
    start: Date;
    end: Date;
  }): Promise<BusinessLogicResult<WidgetActivationInsights[]>> {
    const filters: InsightsFilters = { timeRange };
    return this.getFiltered(filters);
  }

  /**
   * Get insights by type
   */
  async getInsightsByType(
    insightType: "activation" | "retention" | "predictive"
  ): Promise<BusinessLogicResult<any>> {
    const filters: InsightsFilters = { insightType };

    switch (insightType) {
      case "activation":
        return this.getActivationInsights();
      case "retention":
        return this.getRetentionAnalytics();
      case "predictive":
        return this.getPredictiveInsights();
      default:
        throw new Error(`Unknown insight type: ${insightType}`);
    }
  }

  /**
   * Calculate activation insights metrics
   */
  private calculateActivationInsightsMetrics(
    widgets: WidgetActivationInsights[]
  ): ActivationInsightsMetrics {
    const total = widgets.length;
    const activated = widgets.filter((w) => Boolean(w.publishedAt)).length;
    const activationRate = total > 0 ? (activated / total) * 100 : 0;
    const totalLocations = widgets.reduce(
      (sum, w) => sum + (w.numberOfLocations || 0),
      0
    );
    const averageLocations = total > 0 ? totalLocations / total : 0;

    // Calculate activation trend (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent = widgets.filter(
      (w) => w.publishedAt && new Date(w.publishedAt) > thirtyDaysAgo
    ).length;

    const previous = widgets.filter(
      (w) =>
        w.publishedAt &&
        new Date(w.publishedAt) > sixtyDaysAgo &&
        new Date(w.publishedAt) <= thirtyDaysAgo
    ).length;

    const growth =
      previous > 0
        ? ((recent - previous) / previous) * 100
        : recent > 0
          ? 100
          : 0;

    return {
      totalWidgets: total,
      activatedWidgets: activated,
      activationRate,
      totalLocations,
      averageLocations,
      activationTrend: {
        recent,
        previous,
        growth,
      },
    };
  }

  /**
   * Calculate retention analytics metrics
   */
  private calculateRetentionAnalyticsMetrics(
    widgets: WidgetRetentionAnalytics[]
  ): RetentionAnalyticsMetrics {
    const total = widgets.length;
    const retained = widgets.filter((w) => Boolean(w.publishedAt)).length;
    const retentionRate = total > 0 ? (retained / total) * 100 : 0;

    // Calculate average lifespan (time between creation and last update)
    const lifespans = widgets
      .filter((w) => w.publishedAt)
      .map((w) => {
        const created = new Date(w.createdAt);
        const updated = new Date(w.updatedAt);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      });

    const averageLifespan =
      lifespans.length > 0
        ? lifespans.reduce((sum, days) => sum + days, 0) / lifespans.length
        : 0;

    // Count recent updates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUpdates = widgets.filter(
      (w) => new Date(w.updatedAt) > thirtyDaysAgo
    ).length;

    // Calculate retention trend
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recent = widgets.filter(
      (w) => w.publishedAt && new Date(w.updatedAt) > thirtyDaysAgo
    ).length;

    const previous = widgets.filter(
      (w) =>
        w.publishedAt &&
        new Date(w.updatedAt) > sixtyDaysAgo &&
        new Date(w.updatedAt) <= thirtyDaysAgo
    ).length;

    const change =
      previous > 0
        ? ((recent - previous) / previous) * 100
        : recent > 0
          ? 100
          : 0;

    return {
      totalWidgets: total,
      retainedWidgets: retained,
      retentionRate,
      averageLifespan,
      recentUpdates,
      retentionTrend: {
        recent,
        previous,
        change,
      },
    };
  }

  /**
   * Calculate predictive insights metrics
   */
  private calculatePredictiveInsightsMetrics(
    insights: PredictiveInsights[]
  ): PredictiveInsightsMetrics {
    const totalQuarters = insights.length;

    // Calculate predicted growth (average of recent quarters)
    const recentSmartMenusGrowth =
      insights
        .slice(-3) // Last 3 quarters
        .reduce((sum, i) => sum + i.activeSmartMenus.qoqGrowthPercent, 0) / 3;

    const recentOrdersGrowth =
      insights
        .slice(-3) // Last 3 quarters
        .reduce((sum, i) => sum + i.orders.qoqGrowthPercent, 0) / 3;

    // Calculate confidence (based on consistency of growth)
    const smartMenusGrowths = insights.map(
      (i) => i.activeSmartMenus.qoqGrowthPercent
    );
    const ordersGrowths = insights.map((i) => i.orders.qoqGrowthPercent);

    const smartMenusConfidence = this.calculateConfidence(smartMenusGrowths);
    const ordersConfidence = this.calculateConfidence(ordersGrowths);

    return {
      totalQuarters,
      predictedGrowth: {
        smartMenus: recentSmartMenusGrowth,
        orders: recentOrdersGrowth,
      },
      confidence: {
        smartMenus: smartMenusConfidence,
        orders: ordersConfidence,
      },
      trends: insights,
    };
  }

  /**
   * Calculate confidence based on growth consistency
   */
  private calculateConfidence(growths: number[]): number {
    if (growths.length < 2) return 50; // Default confidence

    const mean = growths.reduce((sum, g) => sum + g, 0) / growths.length;
    const variance =
      growths.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) /
      growths.length;
    const standardDeviation = Math.sqrt(variance);

    // Higher consistency (lower std dev) = higher confidence
    const maxStdDev = 50; // Maximum expected standard deviation
    const confidence = Math.max(
      0,
      Math.min(100, 100 - (standardDeviation / maxStdDev) * 100)
    );

    return Math.round(confidence);
  }

  // Override validation methods for insights-specific validation
  protected validateFilters(filters: InsightsFilters): ValidationResult {
    const errors: string[] = [];

    if (filters.timeRange && typeof filters.timeRange !== "object") {
      errors.push("timeRange must be an object");
    }

    if (
      filters.insightType &&
      !["activation", "retention", "predictive"].includes(filters.insightType)
    ) {
      errors.push(
        "insightType must be one of: activation, retention, predictive"
      );
    }

    if (
      filters.quarter !== undefined &&
      (typeof filters.quarter !== "number" ||
        filters.quarter < 1 ||
        filters.quarter > 4)
    ) {
      errors.push("quarter must be a number between 1 and 4");
    }

    if (
      filters.year !== undefined &&
      (typeof filters.year !== "number" || filters.year < 2020)
    ) {
      errors.push("year must be a number >= 2020");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for insights-specific processing
  protected processGetAllResult(
    data: WidgetActivationInsights[]
  ): WidgetActivationInsights[] {
    // Sort by creation date (newest first)
    return data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  protected processFilteredResult(
    data: WidgetActivationInsights[]
  ): WidgetActivationInsights[] {
    // Apply insights-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((insight) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processRetentionAnalyticsResult(
    data: WidgetRetentionAnalytics[]
  ): WidgetRetentionAnalytics[] {
    // Sort by last update (most recently updated first)
    return data.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  protected processPredictiveInsightsResult(
    data: PredictiveInsights[]
  ): PredictiveInsights[] {
    // Sort by year and quarter
    return data.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetInsightsById($id: ID!) {
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
    return WIDGETS_ACTIVATION_INSIGHTS;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredInsights($filters: InsightsFilters) {
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
      query GetInsightsRollups($groupBy: [String!]!) {
        insightsRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetInsightsTrends($timeRange: TimeRange!) {
        insightsTrends(timeRange: $timeRange) {
          period
          activation
          retention
          predictive
        }
      }
    `;
  }

  protected getRetentionAnalyticsQuery(): DocumentNode {
    return WIDGETS_RETENTION_ANALYTICS;
  }

  protected getPredictiveInsightsQuery(): DocumentNode {
    return PREDICTIVE_INSIGHTS;
  }

  // Enhanced metrics calculation for insights
  protected calculateGetAllMetrics(
    data: WidgetActivationInsights[],
    processingTime: number
  ): MetricsData {
    const activatedCount = data.filter((w) => Boolean(w.publishedAt)).length;

    return {
      totalCount: data.length,
      filteredCount: activatedCount,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateFilteredMetrics(
    data: WidgetActivationInsights[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateRetentionAnalyticsMetrics(
    data: WidgetRetentionAnalytics[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculatePredictiveInsightsMetrics(
    data: PredictiveInsights[],
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
