import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  fromPromise,
} from "@apollo/client";
import { ApolloLink, Observable } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getCacheConfig, getQueryTTL } from "../config/cache-config";
import { features } from "../config/environments";

// Cache configuration
const cacheConfig = getCacheConfig();
const CACHE_KEY_PREFIX = cacheConfig.storage.prefix;

// Lambda API configuration
const lambdaApiKey = import.meta.env.VITE_LAMBDA_API_KEY;
const lambdaGraphqlUri = import.meta.env.VITE_LAMBDA_GRAPHQL_URI;

// Check if caching is enabled
function isCachingEnabled() {
  return features.caching;
}

// Debug logging
console.log(
  "[MetabaseApollo] Lambda API Key:",
  lambdaApiKey ? `${lambdaApiKey.substring(0, 8)}...` : "NOT SET"
);
console.log("[MetabaseApollo] Lambda GraphQL URI:", lambdaGraphqlUri);
console.log("[MetabaseApollo] Caching enabled:", isCachingEnabled());

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[MetabaseApollo] GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[MetabaseApollo] Network error: ${networkError}`);

    // If it's a 5xx error, try to serve from cache if available
    if ("statusCode" in networkError && networkError.statusCode >= 500) {
      console.log(
        "[MetabaseApollo] 5xx error detected, attempting to serve from cache"
      );
      const cachedData = getCachedData(operation.operationName);
      if (cachedData) {
        console.log(
          "[MetabaseApollo] Serving stale data from cache due to 5xx error"
        );
        return fromPromise(Promise.resolve({ data: cachedData }));
      }
    }
  }
});

// Cache persistence utilities with query-specific TTLs
function getCachedData(operationName: string) {
  try {
    // Map GraphQL operation names to cache keys
    const operationNameToCacheKey: Record<string, string> = {
      MetabaseUsers: "metabaseUsers",
      QuarterlyMetrics: "dashboard",
      WidgetAnalytics: "dashboard",
      DailyInteractions: "dashboard",
    };

    const cacheKey = operationNameToCacheKey[operationName] || operationName;
    const storageKey = `${CACHE_KEY_PREFIX}-${operationName}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const ttl = getQueryTTL(cacheKey);

      // Return cached data if it's less than the query-specific TTL
      if (age < ttl) {
        console.log(
          `[MetabaseApollo] Serving cached data for ${operationName} (age: ${Math.round(age / 1000 / 60)} minutes, TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
        );
        return data;
      } else {
        console.log(
          `[MetabaseApollo] Cache expired for ${operationName} (age: ${Math.round(age / 1000 / 60)} minutes, TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
        );
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    console.error("[MetabaseApollo] Error reading cache:", error);
  }
  return null;
}

function setCachedData(operationName: string, data: unknown) {
  try {
    // Map GraphQL operation names to cache keys
    const operationNameToCacheKey: Record<string, string> = {
      MetabaseUsers: "metabaseUsers",
      QuarterlyMetrics: "dashboard",
      WidgetAnalytics: "dashboard",
      DailyInteractions: "dashboard",
    };

    const cacheKey = operationNameToCacheKey[operationName] || operationName;
    const storageKey = `${CACHE_KEY_PREFIX}-${operationName}`;
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(cacheEntry));
    const ttl = getQueryTTL(cacheKey);
    console.log(
      `[MetabaseApollo] Cached data for ${operationName} (TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
    );
  } catch (error) {
    console.error("[MetabaseApollo] Error writing cache:", error);
  }
}

// Apollo client factory (so we can re-initialize)
let lambdaClient: ApolloClient<unknown> | null = null;

function createLambdaClient() {
  const cachingEnabled = isCachingEnabled();

  // Custom link for cache-first strategy
  const cacheFirstLink = new ApolloLink((operation, forward) => {
    const operationName = operation.operationName;

    // Check if this operation should bypass cache (network-only, no-cache)
    const context = operation.getContext();
    const fetchPolicy = context.fetchPolicy || "cache-first";

    console.log(
      `[MetabaseApollo] Operation: ${operationName}, FetchPolicy: ${fetchPolicy}, CachingEnabled: ${cachingEnabled}`
    );

    if (
      !cachingEnabled ||
      fetchPolicy === "network-only" ||
      fetchPolicy === "no-cache"
    ) {
      console.log(
        `[MetabaseApollo] Bypassing cache for ${operationName} due to fetchPolicy: ${fetchPolicy}`
      );
      return new Observable((observer) => {
        const subscription = forward(operation).subscribe({
          next: (result) => {
            // Only cache if caching is enabled and not network-only/no-cache
            if (
              result.data &&
              cachingEnabled &&
              fetchPolicy !== "network-only" &&
              fetchPolicy !== "no-cache"
            ) {
              setCachedData(operationName, result.data);
            }
            observer.next(result);
          },
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
        return () => subscription.unsubscribe();
      });
    }

    const cachedData = getCachedData(operationName);
    if (cachedData) {
      console.log(`[MetabaseApollo] Serving cached data for ${operationName}`);
      return Observable.of({ data: cachedData });
    }

    return new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          if (result.data) setCachedData(operationName, result.data);
          observer.next(result);
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      });
      return () => subscription.unsubscribe();
    });
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          quarterlyMetrics: { merge: false },
          widgetAnalytics: { merge: false },
          dailyInteractions: { merge: false },
          widgets: { merge: false },
          // New grouped queries
          dashboardMetrics: { merge: false },
          detailedAnalytics: { merge: false },
          // Metabase users query
          metabaseUsers: { merge: false },
          // Lambda queries
          db_widgetsList: { merge: false },
        },
      },
      // Add type policies for Lambda response types
      DbWidgetsList: {
        keyFields: ["__typename"], // Use typename as key since no ID field
        fields: {
          items: { merge: false },
          pagination: { merge: false },
        },
      },
      PaginationInfo: {
        keyFields: ["__typename"],
      },
    },
  });

  // Only create httpLink and authLink here, and use them in ApolloLink.from
  return new ApolloClient({
    link: ApolloLink.from([
      cacheFirstLink,
      errorLink,
      setContext((_, { headers }) => ({
        headers: {
          ...headers,
          "X-API-Key": lambdaApiKey,
        },
      })),
      createHttpLink({ uri: lambdaGraphqlUri }),
    ]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: cachingEnabled ? "cache-first" : "network-only",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: cachingEnabled ? "cache-first" : "network-only",
        errorPolicy: "all",
      },
    },
  });
}

export function reinitializeLambdaClient() {
  lambdaClient = createLambdaClient();
}

// Initialize on first load
reinitializeLambdaClient();

export { lambdaClient };

// Cache management utilities
export const cacheUtils = {
  // Clear all cached data
  clearCache: () => {
    if (!isCachingEnabled()) {
      console.log("[MetabaseApollo] Caching disabled, no cache to clear");
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log("[MetabaseApollo] Cache cleared");
    } catch (error) {
      console.error("[MetabaseApollo] Error clearing cache:", error);
    }
  },

  // Get cache status with query-specific TTLs
  getCacheStatus: () => {
    if (!isCachingEnabled()) {
      return { enabled: false, message: "Caching is disabled" };
    }

    try {
      // Define expected operations that can be cached (using page-focused keys)
      const expectedOperations = ["dashboard", "metabaseUsers"];

      // Map operation keys to display names
      const operationDisplayNames: Record<string, string> = {
        dashboard: "Dashboard",
        metabaseUsers: "Metabase Users",
      };

      // Map GraphQL operation names to cache keys
      const operationNameToCacheKey: Record<string, string> = {
        MetabaseUsers: "metabaseUsers",
        QuarterlyMetrics: "dashboard", // Part of dashboard page cache
        WidgetAnalytics: "dashboard",
        DailyInteractions: "dashboard",
      };

      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

      // Create a map of cached operations
      const cachedOperations = new Map();
      cacheKeys.forEach((key) => {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          const operationName = key.replace(CACHE_KEY_PREFIX + "-", "");
          // Map GraphQL operation name to cache key
          const cacheKey =
            operationNameToCacheKey[operationName] || operationName;
          const ttl = getQueryTTL(cacheKey);
          cachedOperations.set(cacheKey, {
            operation: cacheKey,
            displayName: operationDisplayNames[cacheKey] || cacheKey,
            age: Math.round(age / 1000 / 60), // minutes
            ttl: Math.round(ttl / 1000 / 60), // minutes
            isStale: age >= ttl,
          });
        }
      });

      // Return status for all expected operations
      const status = expectedOperations.map((operationName) => {
        const cached = cachedOperations.get(operationName);
        if (cached) {
          return cached;
        } else {
          // Operation exists but no cache data
          const ttl = getQueryTTL(operationName);
          return {
            operation: operationName,
            displayName: operationDisplayNames[operationName] || operationName,
            age: 0,
            ttl: Math.round(ttl / 1000 / 60), // minutes
            isStale: false,
            notCached: true, // Flag to indicate no cache data exists
          };
        }
      });

      return { enabled: true, data: status };
    } catch (error) {
      console.error("[MetabaseApollo] Error getting cache status:", error);
      return { enabled: true, data: [] };
    }
  },

  // Force refresh specific operation
  refreshOperation: async (operationName: string) => {
    if (!isCachingEnabled()) {
      console.log("[MetabaseApollo] Caching disabled, no cache to refresh");
      return;
    }

    try {
      const cacheKey = `${CACHE_KEY_PREFIX}-${operationName}`;
      localStorage.removeItem(cacheKey);
      console.log(`[MetabaseApollo] Forced refresh for ${operationName}`);

      // Trigger a refetch by clearing Apollo cache for this query
      await lambdaClient?.resetStore();
    } catch (error) {
      console.error("[MetabaseApollo] Error refreshing operation:", error);
    }
  },

  // Get caching status
  isEnabled: () => isCachingEnabled(),
};

// Scheduled refresh configuration from cache config
const SCHEDULED_REFRESH_TIME = cacheConfig.scheduledRefresh.time;
const SCHEDULED_REFRESH_TIMEZONE = cacheConfig.scheduledRefresh.timezone;
const SCHEDULED_REFRESH_ENABLED = cacheConfig.scheduledRefresh.enabled;

// Background refresh mechanism - runs at scheduled time each day
let scheduledRefreshTimeout: NodeJS.Timeout | null = null;
let scheduledRefreshInterval: NodeJS.Timeout | null = null;

// Calculate milliseconds until next scheduled refresh
function getMillisecondsUntilNextRefresh(): number {
  const now = new Date();
  const [hours, minutes] = SCHEDULED_REFRESH_TIME.split(":").map(Number);

  // Create target time for today
  const targetTime = new Date(now);
  targetTime.setHours(hours, minutes, 0, 0);

  // If target time has passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  return targetTime.getTime() - now.getTime();
}

// Schedule the next refresh
function scheduleNextRefresh() {
  if (!isCachingEnabled() || !SCHEDULED_REFRESH_ENABLED) {
    console.log(
      `[MetabaseApollo] ${!isCachingEnabled() ? "Caching disabled" : "Scheduled refresh disabled"}, skipping scheduled refresh`
    );
    return;
  }

  // Clear any existing timeout
  if (scheduledRefreshTimeout) {
    clearTimeout(scheduledRefreshTimeout);
  }

  const msUntilNext = getMillisecondsUntilNextRefresh();
  const nextRefreshTime = new Date(Date.now() + msUntilNext);

  console.log(
    `[MetabaseApollo] Scheduled next cache refresh for ${nextRefreshTime.toLocaleString()} (${SCHEDULED_REFRESH_TIMEZONE})`
  );

  scheduledRefreshTimeout = setTimeout(() => {
    console.log("[MetabaseApollo] Running scheduled cache refresh");
    cacheUtils.clearCache();

    // Schedule the next refresh (24 hours later)
    scheduleNextRefresh();
  }, msUntilNext);
}

// Start scheduled refresh
export const startScheduledRefresh = () => {
  if (!isCachingEnabled() || !SCHEDULED_REFRESH_ENABLED) {
    console.log(
      `[MetabaseApollo] ${!isCachingEnabled() ? "Caching disabled" : "Scheduled refresh disabled"}, skipping scheduled refresh`
    );
    return;
  }

  // Stop any existing scheduled refresh
  stopScheduledRefresh();

  // Schedule the first refresh
  scheduleNextRefresh();

  console.log(
    `[MetabaseApollo] Scheduled refresh started (daily at ${SCHEDULED_REFRESH_TIME} ${SCHEDULED_REFRESH_TIMEZONE})`
  );
};

// Stop scheduled refresh
export const stopScheduledRefresh = () => {
  if (scheduledRefreshTimeout) {
    clearTimeout(scheduledRefreshTimeout);
    scheduledRefreshTimeout = null;
  }
  if (scheduledRefreshInterval) {
    clearInterval(scheduledRefreshInterval);
    scheduledRefreshInterval = null;
  }
  console.log("[MetabaseApollo] Scheduled refresh stopped");
};

// Legacy function names for backward compatibility
export const startBackgroundRefresh = startScheduledRefresh;
export const stopBackgroundRefresh = stopScheduledRefresh;

// Get scheduled refresh info
export const getScheduledRefreshInfo = () => {
  if (!isCachingEnabled()) {
    return {
      enabled: false,
      message: "Caching is disabled",
    };
  }

  if (!SCHEDULED_REFRESH_ENABLED) {
    return {
      enabled: true,
      scheduled: false,
      message: "Scheduled refresh is disabled",
    };
  }

  if (!scheduledRefreshTimeout) {
    return {
      enabled: true,
      scheduled: false,
      message: "Scheduled refresh not running",
    };
  }

  const msUntilNext = getMillisecondsUntilNextRefresh();
  const nextRefreshTime = new Date(Date.now() + msUntilNext);

  return {
    enabled: true,
    scheduled: true,
    nextRefresh: nextRefreshTime.toISOString(),
    nextRefreshLocal: nextRefreshTime.toLocaleString(),
    timezone: SCHEDULED_REFRESH_TIMEZONE,
    scheduledTime: SCHEDULED_REFRESH_TIME,
  };
};

// Start scheduled refresh when the module loads
if (typeof window !== "undefined") {
  startScheduledRefresh();
}

// Ensure this file is treated as an ES module so `import.meta` is allowed by TypeScript
export {};
