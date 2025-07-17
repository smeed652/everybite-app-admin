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
import { metabaseClient } from "../lib/metabase-apollo";
import { DashboardMetrics, DetailedAnalytics } from "../types/cache";

// Legacy individual query hooks (for backward compatibility)
export const useWidgetAnalytics = (filters?: WidgetAnalyticsFilters) => {
  return useQuery<{ widgetAnalytics: WidgetAnalyticsData }>(
    WIDGET_ANALYTICS_QUERY,
    {
      client: metabaseClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

export const useDailyInteractions = (filters?: DailyInteractionsFilters) => {
  return useQuery<{ dailyInteractions: DailyInteractionsData[] }>(
    DAILY_INTERACTIONS_QUERY,
    {
      client: metabaseClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

export const useQuarterlyMetrics = (filters?: QuarterlyMetricsFilters) => {
  return useQuery<{ quarterlyMetrics: QuarterlyMetricsData[] }>(
    QUARTERLY_METRICS_QUERY,
    {
      client: metabaseClient || undefined,
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
      client: metabaseClient || undefined,
      errorPolicy: "all",
    }
  );
};

export const useDetailedAnalytics = (filters?: DailyInteractionsFilters) => {
  // TODO: Replace with actual GraphQL query once schema is regenerated
  return useQuery<{ detailedAnalytics: DetailedAnalytics }>(
    DAILY_INTERACTIONS_QUERY, // Temporary fallback
    {
      client: metabaseClient || undefined,
      variables: { filters },
      errorPolicy: "all",
    }
  );
};

// Utility function to check if Metabase GraphQL is configured
export const isMetabaseGraphQLConfigured = () => {
  const lambdaGraphqlUri = import.meta.env.VITE_LAMBDA_GRAPHQL_URI;
  const lambdaApiKey = import.meta.env.VITE_LAMBDA_API_KEY;

  return !!(lambdaGraphqlUri && lambdaApiKey);
};

// GraphQL query for Metabase users
// Operation name: MetabaseUsers (this will be used as the cache key)
const METABASE_USERS_QUERY = gql`
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

interface MetabaseUser {
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

interface MetabaseUsersResponse {
  metabaseUsers: {
    users: MetabaseUser[];
    total: number;
  };
}

interface UseMetabaseUsersOptions {
  page?: number;
  pageSize?: number;
}

export const useMetabaseUsersGraphQL = (
  options: UseMetabaseUsersOptions = {}
) => {
  const { page = 1, pageSize = 50 } = options;

  console.log("🔍 [useMetabaseUsersGraphQL] Hook called with options:", {
    page,
    pageSize,
  });

  const { data, loading, error, refetch } = useQuery<MetabaseUsersResponse>(
    METABASE_USERS_QUERY,
    {
      client: metabaseClient || undefined,
      variables: { page, pageSize },
      fetchPolicy: "cache-and-network", // Use cache but also fetch fresh data
      errorPolicy: "all",
    }
  );

  console.log("🔍 [useMetabaseUsersGraphQL] Query result:", {
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
