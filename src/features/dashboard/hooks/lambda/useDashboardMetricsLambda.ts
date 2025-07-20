import { gql, useQuery } from "@apollo/client";
import { lambdaClient } from "../../../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../../../lib/logger";

// GraphQL query for dashboard metrics
const DASHBOARD_METRICS_QUERY = gql`
  query GetDashboardMetrics {
    dashboardMetrics {
      widgetSummary {
        totalWidgets
        activeWidgets
        totalLocations
        totalOrders
        averageOrdersPerWidget
      }
      quarterlyMetrics {
        quarter
        year
        quarterLabel
        brands {
          count
          qoqGrowth
          qoqGrowthPercent
        }
        locations {
          count
          qoqGrowth
          qoqGrowthPercent
        }
        orders {
          count
          qoqGrowth
          qoqGrowthPercent
        }
        activeSmartMenus {
          count
          qoqGrowth
          qoqGrowthPercent
        }
        totalRevenue {
          amount
          qoqGrowth
          qoqGrowthPercent
        }
      }
      kpis {
        totalRevenue
        totalDinerVisits
        averageOrderValue
        conversionRate
      }
    }
  }
`;

interface DashboardMetricsResponse {
  dashboardMetrics: {
    widgetSummary: {
      totalWidgets: number;
      activeWidgets: number;
      totalLocations: number;
      totalOrders: number;
      averageOrdersPerWidget: number;
    };
    quarterlyMetrics: Array<{
      quarter: string;
      year: number;
      quarterLabel: string;
      brands: {
        count: number;
        qoqGrowth: number;
        qoqGrowthPercent: number;
      };
      locations: {
        count: number;
        qoqGrowth: number;
        qoqGrowthPercent: number;
      };
      orders: {
        count: number;
        qoqGrowth: number;
        qoqGrowthPercent: number;
      };
      activeSmartMenus: {
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
    kpis: {
      totalRevenue: number;
      totalDinerVisits: number;
      averageOrderValue: number;
      conversionRate: number;
    };
  };
}

export function useDashboardMetricsLambda() {
  const { data, loading, error } = useQuery<DashboardMetricsResponse>(
    DASHBOARD_METRICS_QUERY,
    {
      client: lambdaClient!,
      fetchPolicy: "cache-and-network",
    }
  );

  // Logging for debugging
  logger.info("[DashboardMetrics] Lambda data:", data);
  logger.info("[DashboardMetrics] Loading state:", loading);
  if (error) {
    logger.error("[DashboardMetrics] Lambda error:", error);
  }

  const widgetSummary = data?.dashboardMetrics?.widgetSummary;
  const quarterlyMetrics = data?.dashboardMetrics?.quarterlyMetrics || [];
  const kpis = data?.dashboardMetrics?.kpis;

  // Extract metrics for backward compatibility
  const metrics = {
    total: widgetSummary?.totalWidgets || 0,
    active: widgetSummary?.activeWidgets || 0,
    totalLocations: widgetSummary?.totalLocations || 0,
    totalDelta: "0%", // TODO: Calculate from quarterly data
    activeDelta: "0%", // TODO: Calculate from quarterly data
    locationsDelta: "0%", // TODO: Calculate from quarterly data
  };

  return {
    metrics,
    widgetSummary,
    quarterlyMetrics,
    kpis,
    loading,
    error: error?.message || null,
  } as const;
}
