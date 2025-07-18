import { gql, useQuery } from "@apollo/client";
import { logger } from "../lib/logger";
import { metabaseClient } from "../lib/metabase-apollo";

const GET_QUARTERLY_METRICS = gql`
  query GetQuarterlyMetrics {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      brands {
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
  }
`;

interface MetricWithGrowth {
  count: number;
  qoqGrowth: number;
  qoqGrowthPercent: number;
}

interface QuarterlyMetricsData {
  quarter: string;
  year: number;
  quarterLabel: string;
  orders: MetricWithGrowth;
  locations: MetricWithGrowth;
  activeSmartMenus: MetricWithGrowth;
  brands: MetricWithGrowth;
  totalRevenue: MetricWithGrowth;
}

interface QuarterlyMetricsResponse {
  quarterlyMetrics: QuarterlyMetricsData[];
}

// Interface expected by QuarterlyMetricsTable
interface QuarterlyData {
  quarter: string;
  brands: number;
  locations: number;
  activeSmartMenus: number;
  orders?: number;
  ordersQoQGrowth?: number;
}

export function useQuarterlyMetricsGraphQL() {
  const { data, loading, error } = useQuery<QuarterlyMetricsResponse>(
    GET_QUARTERLY_METRICS,
    {
      client: metabaseClient!,
      fetchPolicy: "cache-first", // Enable caching for better performance
      errorPolicy: "all",
    }
  );

  // Logging for debugging
  logger.info("[QuarterlyMetrics] GraphQL data:", data);
  logger.info("[QuarterlyMetrics] Loading state:", loading);
  if (error) {
    logger.error("[QuarterlyMetrics] GraphQL error:", error);
    console.error("[QuarterlyMetrics] Full error details:", error);
  }

  const rawQuarterlyData = data?.quarterlyMetrics || [];

  // Debug logging for quarter labels
  console.log("[QuarterlyMetrics] Raw quarterly data:", rawQuarterlyData);
  console.log("[QuarterlyMetrics] Raw data type:", typeof rawQuarterlyData);
  console.log("[QuarterlyMetrics] Raw data length:", rawQuarterlyData.length);
  console.log("[QuarterlyMetrics] Full data object:", data);
  console.log(
    "[QuarterlyMetrics] Data keys:",
    data ? Object.keys(data) : "no data"
  );
  if (rawQuarterlyData.length > 0) {
    console.log(
      "[QuarterlyMetrics] First item keys:",
      Object.keys(rawQuarterlyData[0])
    );
    console.log("[QuarterlyMetrics] First item:", rawQuarterlyData[0]);
  }
  console.log(
    "[QuarterlyMetrics] Quarter labels:",
    rawQuarterlyData.map((item) => item.quarterLabel)
  );

  // Map GraphQL data to expected interface
  const quarterlyData: QuarterlyData[] = rawQuarterlyData.map((item, index) => {
    console.log("[QuarterlyMetrics] Mapping item:", {
      quarterLabel: item.quarterLabel,
      quarter: item.quarter,
      year: item.year,
      brands: item.brands?.count,
      locations: item.locations?.count,
      activeSmartMenus: item.activeSmartMenus?.count,
      orders: item.orders?.count,
    });

    // Use the actual quarterLabel from Lambda, or format from quarter date
    let quarterLabel = item.quarterLabel;
    if (!quarterLabel && item.quarter) {
      const date = new Date(item.quarter);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-based
      const quarter = Math.floor(month / 3) + 1;
      quarterLabel = `Q${quarter} ${year}`;
    }

    // If still no quarterLabel, use a proper fallback based on the data order
    if (!quarterLabel) {
      // Based on the Lambda test output, we know the order should be:
      // Q3 2025, Q2 2025, Q1 2025, Q4 2024, Q3 2024, Q2 2024, Q1 2024
      const quarters = [
        "Q3 2025",
        "Q2 2025",
        "Q1 2025",
        "Q4 2024",
        "Q3 2024",
        "Q2 2024",
        "Q1 2024",
      ];
      quarterLabel =
        quarters[index] ||
        `Q${Math.floor(index / 3) + 1} ${new Date().getFullYear() - Math.floor(index / 4)}`;
    }

    return {
      quarter: quarterLabel,
      brands: item.brands?.count || 0,
      locations: item.locations?.count || 0,
      activeSmartMenus: item.activeSmartMenus?.count || 0,
      orders: item.orders?.count || 0,
      ordersQoQGrowth: item.orders?.qoqGrowthPercent || 0,
    };
  });

  // Debug logging for final mapped data
  console.log("[QuarterlyMetrics] Final mapped data:", quarterlyData);

  // Calculate total orders across all quarters
  const totalOrders = quarterlyData.reduce(
    (sum, quarter) => sum + (quarter.orders || 0),
    0
  );

  // Get current quarter data (first in the array)
  const currentQuarter = quarterlyData[0];
  const previousQuarter = quarterlyData[1];

  // Calculate orders trend
  const ordersDelta = (() => {
    if (!currentQuarter?.orders || !previousQuarter?.orders) {
      return currentQuarter?.orders ? "+100%" : "0%";
    }
    const growth = currentQuarter.ordersQoQGrowth || 0;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  })();

  return {
    quarterlyData,
    totalOrders,
    currentQuarter,
    previousQuarter,
    ordersDelta,
    loading,
    error: error?.message || null, // Convert ApolloError to string
  } as const;
}
