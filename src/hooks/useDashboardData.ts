import { gql, useQuery } from "@apollo/client";
import { logger } from "../lib/logger";
import { useQuarterlyMetricsGraphQL } from "./useQuarterlyMetricsGraphQL";

// Consolidated query for all dashboard widgets data
const GET_DASHBOARD_WIDGETS = gql /* GraphQL */ `
  query GetDashboardWidgets {
    widgets {
      id
      createdAt
      publishedAt
      numberOfLocations
      # Analytics fields for player analytics
      displayImages
      layout
      isOrderButtonEnabled
      isByoEnabled
    }
  }
`;

interface DashboardWidget {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number | null;
  displayImages: boolean;
  layout?: string | null;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;
}

interface DashboardData {
  widgets: DashboardWidget[];
}

export function useDashboardData() {
  // Main dashboard widgets query with cache-first strategy
  const {
    data: widgetsData,
    loading: widgetsLoading,
    error: widgetsError,
  } = useQuery<DashboardData>(GET_DASHBOARD_WIDGETS, {
    fetchPolicy: "cache-first", // Use cache first for better performance
    errorPolicy: "all",
  });

  // Quarterly metrics with caching enabled
  const {
    quarterlyData,
    totalOrders,
    ordersDelta,
    loading: quarterlyLoading,
    error: quarterlyError,
  } = useQuarterlyMetricsGraphQL();

  // Logging for debugging
  logger.info("[DashboardData] Widgets data:", widgetsData);
  logger.info("[DashboardData] Quarterly data:", quarterlyData);
  logger.info("[DashboardData] Loading states:", {
    widgets: widgetsLoading,
    quarterly: quarterlyLoading,
  });

  if (widgetsError) {
    logger.error("[DashboardData] Widgets error:", widgetsError);
  }
  if (quarterlyError) {
    logger.error("[DashboardData] Quarterly error:", quarterlyError);
  }

  // Process widgets data for metrics cards
  const widgets = widgetsData?.widgets ?? [];
  const total = widgets.length;
  const active = widgets.filter((w) => Boolean(w.publishedAt)).length;

  // Calculate total locations for active SmartMenus
  const activeWidgets = widgets.filter((w) => Boolean(w.publishedAt));
  const totalLocations = activeWidgets.reduce(
    (sum, w) => sum + (w.numberOfLocations || 0),
    0
  );

  // Calculate analytics data from consolidated widgets
  const analyticsData = {
    totalActive: active || 1,
    withImages: activeWidgets.filter((w) => w.displayImages).length,
    withCardLayout: activeWidgets.filter(
      (w) => (w.layout || "").toUpperCase() === "CARD"
    ).length,
    withOrdering: activeWidgets.filter((w) => w.isOrderButtonEnabled).length,
    withByo: activeWidgets.filter((w) => w.isByoEnabled).length,
  };

  return {
    // Widgets data
    widgets,
    total,
    active,
    totalLocations,
    widgetsLoading,
    widgetsError,

    // Quarterly metrics
    quarterlyData,
    totalOrders,
    ordersDelta,
    quarterlyLoading,
    quarterlyError,

    // Analytics data (consolidated)
    analyticsData,

    // Overall loading state
    loading: widgetsLoading || quarterlyLoading,
    error: widgetsError || quarterlyError,
  } as const;
}
