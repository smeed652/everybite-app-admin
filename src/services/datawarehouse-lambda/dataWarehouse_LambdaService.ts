import { DocumentNode } from "@apollo/client";
import {
  LAMBDA_GET_DASHBOARD_WIDGETS,
  LAMBDA_GET_PLAYER_ANALYTICS,
  LAMBDA_GET_QUARTERLY_METRICS,
} from "../../features/dashboard/graphql/lambda/queries";
import { lambdaClient } from "../../lib/datawarehouse-lambda-apollo";
import { QuarterlyMetricsData, WidgetAnalyticsData } from "../../types/cache";
import { DashboardData, ServiceResult } from "../../types/services";

/**
 * Service for fetching data from EveryBite Data Warehouse via Lambda
 * Following naming convention: {DataSource}_{Transport}Service
 */
export class DataWarehouse_LambdaService {
  private client = lambdaClient;

  /**
   * Execute a GraphQL query and return standardized result
   */
  private async executeQuery<T>(
    query: DocumentNode,
    variables?: unknown
  ): Promise<ServiceResult<T>> {
    try {
      const result = await this.client.query({
        query,
        variables,
        fetchPolicy: "cache-first",
      });
      return { data: result.data, error: null };
    } catch (error) {
      console.error("[DataWarehouse_LambdaService] Query error:", error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get quarterly metrics data
   */
  async getQuarterlyMetrics(): Promise<ServiceResult<QuarterlyMetricsData>> {
    return this.executeQuery(LAMBDA_GET_QUARTERLY_METRICS);
  }

  /**
   * Get dashboard widgets data
   */
  async getWidgetAnalytics(): Promise<ServiceResult<WidgetAnalyticsData>> {
    return this.executeQuery(LAMBDA_GET_DASHBOARD_WIDGETS);
  }

  /**
   * Get player analytics data
   */
  async getPlayerAnalytics(): Promise<ServiceResult<unknown>> {
    return this.executeQuery(LAMBDA_GET_PLAYER_ANALYTICS);
  }

  /**
   * Prefetch all dashboard data for caching
   */
  async prefetchDashboardData(): Promise<ServiceResult<DashboardData>> {
    try {
      const [quarterly, widgets, analytics] = await Promise.all([
        this.getQuarterlyMetrics(),
        this.getWidgetAnalytics(),
        this.getPlayerAnalytics(),
      ]);

      return {
        data: {
          quarterly: quarterly.data,
          widgets: widgets.data,
          analytics: analytics.data,
        },
        error: null,
      };
    } catch (error) {
      console.error("[DataWarehouse_LambdaService] Prefetch error:", error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Refresh dashboard data (network-only)
   */
  async refreshDashboardData(): Promise<ServiceResult<DashboardData>> {
    try {
      const [quarterly, widgets, analytics] = await Promise.all([
        this.client.query({
          query: LAMBDA_GET_QUARTERLY_METRICS,
          fetchPolicy: "network-only",
        }),
        this.client.query({
          query: LAMBDA_GET_DASHBOARD_WIDGETS,
          fetchPolicy: "network-only",
        }),
        this.client.query({
          query: LAMBDA_GET_PLAYER_ANALYTICS,
          fetchPolicy: "network-only",
        }),
      ]);

      return {
        data: {
          quarterly: quarterly.data,
          widgets: widgets.data,
          analytics: analytics.data,
        },
        error: null,
      };
    } catch (error) {
      console.error("[DataWarehouse_LambdaService] Refresh error:", error);
      return { data: null, error: error as Error };
    }
  }
}

// Export singleton instance
export const dataWarehouse_LambdaService = new DataWarehouse_LambdaService();
