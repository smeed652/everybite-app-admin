import { gql, useQuery } from "@apollo/client";
import {
  DAILY_INTERACTIONS_QUERY,
  DailyInteractionsData,
  DailyInteractionsFilters,
  QUARTERLY_METRICS_QUERY,
  QuarterlyMetricsData,
  QuarterlyMetricsFilters,
  WIDGET_ANALYTICS_QUERY,
  WidgetAnalyticsData,
  WidgetAnalyticsFilters,
} from "../generated/metabase-graphql";
import { lambdaClient } from "../lib/datawarehouse-lambda-apollo";
import { DashboardMetrics, DetailedAnalytics } from "../types/cache";

/**
 * Hook for fetching analytics data from EveryBite Data Warehouse
 * via AWS Lambda function with GraphQL interface
 */

// Legacy individual query hooks (for backward compatibility)
export const useWidgetAnalytics = (filters?: WidgetAnalyticsFilters) => {
  return useQuery<{ widgetAnalytics: WidgetAnalyticsData }>(
    WIDGET_ANALYTICS_QUERY,
    {
      client: lambdaClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

export const useDailyInteractions = (filters?: DailyInteractionsFilters) => {
  return useQuery<{ dailyInteractions: DailyInteractionsData[] }>(
    DAILY_INTERACTIONS_QUERY,
    {
      client: lambdaClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

export const useQuarterlyMetrics = (filters?: QuarterlyMetricsFilters) => {
  return useQuery<{ quarterlyMetrics: QuarterlyMetricsData[] }>(
    QUARTERLY_METRICS_QUERY,
    {
      client: lambdaClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

// New grouped analytics query hooks
// Note: These will need to be updated once the GraphQL schema is regenerated
export const useDashboardMetrics = () => {
  // TODO: Replace with actual GraphQL query once schema is regenerated
  return useQuery<{ dashboardMetrics: DashboardMetrics }>(
    QUARTERLY_METRICS_QUERY, // Temporary fallback
    {
      client: lambdaClient || undefined,
      errorPolicy: "all",
    }
  );
};

export const useDetailedAnalytics = (filters?: DailyInteractionsFilters) => {
  // TODO: Replace with actual GraphQL query once schema is regenerated
  return useQuery<{ detailedAnalytics: DetailedAnalytics }>(
    DAILY_INTERACTIONS_QUERY, // Temporary fallback
    {
      client: lambdaClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

// Utility function to check if Data Warehouse GraphQL is configured
export const isDataWarehouseGraphQLConfigured = () => {
  const lambdaGraphqlUri = import.meta.env.VITE_LAMBDA_GRAPHQL_URI;
  const lambdaApiKey = import.meta.env.VITE_LAMBDA_API_KEY;

  return !!(lambdaGraphqlUri && lambdaApiKey);
};

// GraphQL query for Data Warehouse users
// Operation name: MetabaseUsers (this will be used as the cache key)
const DATA_WAREHOUSE_USERS_QUERY = gql`
  query MetabaseUsers($page: Int, $pageSize: Int) {
    metabaseUsers(page: $page, pageSize: $pageSize) {
      users {
        id
        email
        firstName
        lastName
        name
        dateJoined
        lastLogin
        isActive
        isSuperuser
        isQbnewb
        locale
        ssoSource
      }
      total
    }
  }
`;

interface DataWarehouseUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  dateJoined?: string;
  lastLogin?: string;
  isActive: boolean;
  isSuperuser: boolean;
  isQbnewb: boolean;
  locale?: string;
  ssoSource?: string;
}

interface DataWarehouseUsersResponse {
  metabaseUsers: {
    users: DataWarehouseUser[];
    total: number;
  };
}

interface UseDataWarehouseUsersOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Hook for fetching users data from EveryBite Data Warehouse
 * via AWS Lambda function with GraphQL interface
 */
export const useDataWarehouseUsers_Lambda = (
  options: UseDataWarehouseUsersOptions = {}
) => {
  const { page = 1, pageSize = 50 } = options;

  console.log("🔍 [useDataWarehouseUsers_Lambda] Hook called with options:", {
    page,
    pageSize,
  });

  const { data, loading, error, refetch } =
    useQuery<DataWarehouseUsersResponse>(DATA_WAREHOUSE_USERS_QUERY, {
      client: lambdaClient || undefined,
      variables: { page, pageSize },
      fetchPolicy: "cache-and-network", // Use cache but also fetch fresh data
      errorPolicy: "all",
    });

  console.log("🔍 [useDataWarehouseUsers_Lambda] Query result:", {
    data: data?.metabaseUsers,
    loading,
    error: error?.message,
    hasData: !!data?.metabaseUsers,
  });

  return {
    users: data?.metabaseUsers || { users: [], total: 0 },
    loading,
    error: error?.message || null,
    refetch,
  };
};
