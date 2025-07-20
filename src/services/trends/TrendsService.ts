import { DocumentNode, gql } from "@apollo/client";
import {
  ORDERS_DAILY_TRENDS,
  WIDGETS_MONTHLY_GROWTH,
  WIDGETS_QUARTERLY_TRENDS,
} from "../../features/dashboard/graphql/lambda/queries/trends";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface WidgetQuarterlyTrends {
  quarter: number;
  year: number;
  quarterLabel: string;
  activeSmartMenus: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  locations: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface WidgetMonthlyGrowth {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number;
}

export interface OrdersDailyTrends {
  date: string;
  count: number;
  growth: number;
  growthPercent: number;
}

export interface TrendsFilters {
  timeRange?: {
    start: Date;
    end: Date;
  };
  quarter?: number;
  year?: number;
  period?: "daily" | "monthly" | "quarterly";
}

export interface QuarterlyTrendsMetrics {
  totalQuarters: number;
  totalActiveSmartMenus: number;
  totalLocations: number;
  averageGrowth: {
    smartMenus: number;
    locations: number;
  };
  trends: WidgetQuarterlyTrends[];
}

export interface MonthlyGrowthMetrics {
  totalWidgets: number;
  activeWidgets: number;
  totalLocations: number;
  growthRate: number;
  monthlyBreakdown: Record<string, number>;
}

export interface DailyOrdersMetrics {
  totalDays: number;
  totalOrders: number;
  averageOrders: number;
  growthRate: number;
  dailyBreakdown: Record<string, number>;
}

/**
 * Trends Service - Handles trends-specific queries and business logic
 *
 * This service provides methods for:
 * - Quarterly widget trends analysis
 * - Monthly growth analysis
 * - Daily order trends
 * - Combined trends insights
 */
export class TrendsService extends DataService<
  WidgetQuarterlyTrends,
  TrendsFilters
> {
  constructor(config?: DataServiceConfig) {
    super("TrendsService", config);
  }

  /**
   * Get quarterly trends
   */
  async getQuarterlyTrends(): Promise<
    BusinessLogicResult<QuarterlyTrendsMetrics>
  > {
    const startTime = Date.now();

    try {
      const result = await this.getAll();
      const trends = result.data;

      const metrics = this.calculateQuarterlyTrendsMetrics(trends);
      const processingTime = Date.now() - startTime;

      return {
        data: metrics,
        metrics: {
          totalCount: trends.length,
          filteredCount: trends.length,
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
   * Get monthly growth
   */
  async getMonthlyGrowth(): Promise<BusinessLogicResult<MonthlyGrowthMetrics>> {
    const document = this.getMonthlyGrowthQuery();

    return this.executeQuery<WidgetMonthlyGrowth[]>(document, undefined, {
      processResult: (data) => this.processMonthlyGrowthResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateMonthlyGrowthMetrics(data, processingTime),
    }).then((result) => {
      const widgets = result.data;
      const metrics = this.calculateMonthlyGrowthMetrics(widgets);

      return {
        data: metrics,
        metrics: result.metrics,
      };
    });
  }

  /**
   * Get daily orders trends
   */
  async getDailyOrdersTrends(): Promise<
    BusinessLogicResult<DailyOrdersMetrics>
  > {
    const document = this.getDailyOrdersTrendsQuery();

    return this.executeQuery<OrdersDailyTrends[]>(document, undefined, {
      processResult: (data) => this.processDailyOrdersTrendsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateDailyOrdersTrendsMetrics(data, processingTime),
    }).then((result) => {
      const orders = result.data;
      const metrics = this.calculateDailyOrdersMetrics(orders);

      return {
        data: metrics,
        metrics: result.metrics,
      };
    });
  }

  /**
   * Get trends by time range
   */
  async getTrendsByTimeRange(timeRange: {
    start: Date;
    end: Date;
  }): Promise<BusinessLogicResult<WidgetQuarterlyTrends[]>> {
    const filters: TrendsFilters = { timeRange };
    return this.getFiltered(filters);
  }

  /**
   * Get trends by quarter
   */
  async getTrendsByQuarter(
    quarter: number,
    year: number
  ): Promise<BusinessLogicResult<WidgetQuarterlyTrends[]>> {
    const filters: TrendsFilters = { quarter, year };
    return this.getFiltered(filters);
  }

  /**
   * Calculate quarterly trends metrics
   */
  private calculateQuarterlyTrendsMetrics(
    trends: WidgetQuarterlyTrends[]
  ): QuarterlyTrendsMetrics {
    const totalQuarters = trends.length;
    const totalActiveSmartMenus = trends.reduce(
      (sum, t) => sum + t.activeSmartMenus.count,
      0
    );
    const totalLocations = trends.reduce(
      (sum, t) => sum + t.locations.count,
      0
    );

    // Calculate average growth
    const smartMenusGrowth = trends.reduce(
      (sum, t) => sum + t.activeSmartMenus.qoqGrowthPercent,
      0
    );
    const locationsGrowth = trends.reduce(
      (sum, t) => sum + t.locations.qoqGrowthPercent,
      0
    );

    const averageGrowth = {
      smartMenus: totalQuarters > 0 ? smartMenusGrowth / totalQuarters : 0,
      locations: totalQuarters > 0 ? locationsGrowth / totalQuarters : 0,
    };

    return {
      totalQuarters,
      totalActiveSmartMenus,
      totalLocations,
      averageGrowth,
      trends,
    };
  }

  /**
   * Calculate monthly growth metrics
   */
  private calculateMonthlyGrowthMetrics(
    widgets: WidgetMonthlyGrowth[]
  ): MonthlyGrowthMetrics {
    const total = widgets.length;
    const active = widgets.filter((w) => Boolean(w.publishedAt)).length;
    const totalLocations = widgets.reduce(
      (sum, w) => sum + (w.numberOfLocations || 0),
      0
    );

    // Calculate growth rate (active vs total)
    const growthRate = total > 0 ? (active / total) * 100 : 0;

    // Monthly breakdown
    const monthlyBreakdown = widgets.reduce(
      (acc, widget) => {
        const date = new Date(widget.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalWidgets: total,
      activeWidgets: active,
      totalLocations,
      growthRate,
      monthlyBreakdown,
    };
  }

  /**
   * Calculate daily orders metrics
   */
  private calculateDailyOrdersMetrics(
    orders: OrdersDailyTrends[]
  ): DailyOrdersMetrics {
    const totalDays = orders.length;
    const totalOrders = orders.reduce((sum, o) => sum + o.count, 0);
    const averageOrders = totalDays > 0 ? totalOrders / totalDays : 0;

    // Calculate growth rate
    const totalGrowth = orders.reduce((sum, o) => sum + o.growthPercent, 0);
    const growthRate = totalDays > 0 ? totalGrowth / totalDays : 0;

    // Daily breakdown
    const dailyBreakdown = orders.reduce(
      (acc, order) => {
        acc[order.date] = order.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalDays,
      totalOrders,
      averageOrders,
      growthRate,
      dailyBreakdown,
    };
  }

  // Override validation methods for trends-specific validation
  protected validateFilters(filters: TrendsFilters): ValidationResult {
    const errors: string[] = [];

    if (filters.timeRange && typeof filters.timeRange !== "object") {
      errors.push("timeRange must be an object");
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

    if (
      filters.period &&
      !["daily", "monthly", "quarterly"].includes(filters.period)
    ) {
      errors.push("period must be one of: daily, monthly, quarterly");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for trends-specific processing
  protected processGetAllResult(
    data: WidgetQuarterlyTrends[]
  ): WidgetQuarterlyTrends[] {
    // Sort by year and quarter
    return data.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
  }

  protected processFilteredResult(
    data: WidgetQuarterlyTrends[]
  ): WidgetQuarterlyTrends[] {
    // Apply trends-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((trend) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processMonthlyGrowthResult(
    data: WidgetMonthlyGrowth[]
  ): WidgetMonthlyGrowth[] {
    // Sort by creation date
    return data.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  protected processDailyOrdersTrendsResult(
    data: OrdersDailyTrends[]
  ): OrdersDailyTrends[] {
    // Sort by date
    return data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetTrendsById($id: ID!) {
        quarterlyMetrics {
          quarter
          year
          quarterLabel
          activeSmartMenus {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          locations {
            count
            qoqGrowth
            qoqGrowthPercent
          }
        }
      }
    `;
  }

  protected getAllQuery(): DocumentNode {
    return WIDGETS_QUARTERLY_TRENDS;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredTrends($filters: TrendsFilters) {
        quarterlyMetrics(filters: $filters) {
          quarter
          year
          quarterLabel
          activeSmartMenus {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          locations {
            count
            qoqGrowth
            qoqGrowthPercent
          }
        }
      }
    `;
  }

  protected getRollupsQuery(): DocumentNode {
    return gql`
      query GetTrendsRollups($groupBy: [String!]!) {
        trendsRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetTrends($timeRange: TimeRange!) {
        trends(timeRange: $timeRange) {
          period
          total
          active
          growth
          trends
        }
      }
    `;
  }

  protected getMonthlyGrowthQuery(): DocumentNode {
    return WIDGETS_MONTHLY_GROWTH;
  }

  protected getDailyOrdersTrendsQuery(): DocumentNode {
    return ORDERS_DAILY_TRENDS;
  }

  // Enhanced metrics calculation for trends
  protected calculateGetAllMetrics(
    data: WidgetQuarterlyTrends[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateFilteredMetrics(
    data: WidgetQuarterlyTrends[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateMonthlyGrowthMetrics(
    data: WidgetMonthlyGrowth[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateDailyOrdersTrendsMetrics(
    data: OrdersDailyTrends[],
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
