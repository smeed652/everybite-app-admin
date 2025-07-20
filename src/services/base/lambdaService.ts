import {
  ApolloClient,
  ApolloQueryResult,
  DocumentNode,
  FetchPolicy,
  OperationVariables,
} from "@apollo/client";
import { getCacheConfig } from "../../config/cache-config";
import { lambdaClient } from "../../lib/datawarehouse-lambda-apollo";

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

export interface ServiceConfig {
  client?: ApolloClient<unknown>;
  defaultFetchPolicy?: FetchPolicy;
  enableLogging?: boolean;
}

export interface PrefetchResult<T> {
  data: T;
  error: null;
}

// Cache configuration
const cacheConfig = getCacheConfig();
const CACHE_KEY_PREFIX = cacheConfig.storage.prefix;

// Service-level cache utilities
function getOperationTTL(operationName: string): number {
  // Get the current cache configuration (which may have been updated via UI)
  const currentConfig = getCacheConfig();

  // Check if this operation has a specific TTL configured
  if (currentConfig.operationTTLs[operationName] !== undefined) {
    return currentConfig.operationTTLs[operationName];
  }

  // Return the default TTL from configuration
  return currentConfig.ttl;
}

function getCachedData(operationName: string) {
  try {
    const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const ttl = getOperationTTL(operationName);

      // Don't cache mutations (TTL = 0)
      if (ttl === 0) {
        return null;
      }

      // Return cached data if it's less than the operation TTL
      if (age < ttl) {
        console.log(
          `[LambdaService] Serving cached data for ${operationName} (age: ${Math.round(age / 1000 / 60)} minutes, TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
        );
        return data;
      } else {
        console.log(
          `[LambdaService] Cache expired for ${operationName} (age: ${Math.round(age / 1000 / 60)} minutes, TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
        );
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    console.error("[LambdaService] Error reading cache:", error);
  }
  return null;
}

function setCachedData(operationName: string, data: unknown) {
  try {
    const ttl = getOperationTTL(operationName);

    // Debug logging for MetabaseUsers
    if (operationName === "MetabaseUsers") {
      console.log("[LambdaService] MetabaseUsers TTL debug:", {
        operationName,
        ttl,
        ttlHours: Math.round(ttl / (1000 * 60 * 60)),
        currentConfig: getCacheConfig().operationTTLs,
        cacheConfig: getCacheConfig(),
      });
    }

    // Don't cache mutations (TTL = 0)
    if (ttl === 0) {
      console.log(
        `[LambdaService] Skipping cache for ${operationName} (TTL = 0)`
      );
      return;
    }

    const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(cacheEntry));
    console.log(
      `[LambdaService] Cached data for ${operationName} (TTL: ${Math.round(ttl / 1000 / 60)} minutes)`
    );
  } catch (error) {
    console.error("[LambdaService] Error writing cache:", error);
  }
}

/**
 * Base Lambda GraphQL Service - Reusable across Node.js applications
 *
 * This module can be extracted into a separate npm package:
 * @example
 * ```bash
 * npm install @everybite/lambda-graphql-service
 * ```
 *
 * @example
 * ```typescript
 * import { lambdaService } from '@everybite/lambda-graphql-service';
 *
 * const result = await lambdaService.query(MY_QUERY, { id: 123 });
 * ```
 */
export const lambdaService = {
  /**
   * Execute a GraphQL query with operation-level caching
   */
  async query<T>(
    document: DocumentNode,
    variables?: OperationVariables,
    config?: ServiceConfig
  ): Promise<ServiceResult<T>> {
    const client = config?.client || lambdaClient;
    const fetchPolicy = config?.defaultFetchPolicy || "cache-first";

    if (!client) {
      return { data: null, error: new Error("Apollo client not available") };
    }

    const operationName =
      document.definitions[0]?.kind === "OperationDefinition"
        ? (document.definitions[0] as { name?: { value: string } }).name
            ?.value || "Unknown"
        : "Unknown";

    try {
      if (config?.enableLogging) {
        console.log(`[LambdaService] Executing query: ${operationName}`);
        console.log(`[LambdaService] Operation name debug:`, {
          operationName,
          documentDefinitions: document.definitions,
          firstDefinition: document.definitions[0],
        });
      }

      // Check operation-level cache first
      const cachedData = getCachedData(operationName);
      if (
        cachedData &&
        fetchPolicy !== "network-only" &&
        fetchPolicy !== "no-cache"
      ) {
        console.log(`[LambdaService] Serving cached data for ${operationName}`);
        return { data: cachedData as T, error: null };
      }

      const result: ApolloQueryResult<T> = await client.query({
        query: document,
        variables,
        fetchPolicy,
      });

      // Cache the result at operation level
      if (result.data) {
        setCachedData(operationName, result.data);
      }

      return { data: result.data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[LambdaService] Query error: ${errorMessage}`);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Execute a GraphQL mutation (never cached)
   */
  async mutation<T>(
    document: DocumentNode,
    variables?: OperationVariables,
    config?: ServiceConfig
  ): Promise<ServiceResult<T>> {
    const client = config?.client || lambdaClient;

    if (!client) {
      return { data: null, error: new Error("Apollo client not available") };
    }

    const operationName =
      document.definitions[0]?.kind === "OperationDefinition"
        ? (document.definitions[0] as { name?: { value: string } }).name
            ?.value || "Unknown"
        : "Unknown";

    try {
      if (config?.enableLogging) {
        console.log(`[LambdaService] Executing mutation: ${operationName}`);
      }

      const result = await client.mutate({
        mutation: document,
        variables,
      });

      return { data: result.data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[LambdaService] Mutation error: ${errorMessage}`);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Prefetch multiple queries in parallel with operation-level caching
   */
  async prefetch<T extends Record<string, unknown>>(
    queries: Array<{
      key: string;
      document: DocumentNode;
      variables?: OperationVariables;
    }>,
    config?: ServiceConfig
  ): Promise<ServiceResult<T>> {
    try {
      if (config?.enableLogging) {
        console.log(`[LambdaService] Prefetching ${queries.length} queries`);
      }

      const promises = queries.map(async ({ key, document, variables }) => {
        const result = await this.query(document, variables, config);
        return { key, result };
      });

      const results = await Promise.all(promises);

      // Check for any errors
      const errors = results.filter((r) => r.result.error);
      if (errors.length > 0) {
        console.error(`[LambdaService] Prefetch errors:`, errors);
        return {
          data: null,
          error: new Error(`Failed to prefetch ${errors.length} queries`),
        };
      }

      // Combine all successful results
      const data = results.reduce((acc, { key, result }) => {
        acc[key as keyof T] = result.data as T[keyof T];
        return acc;
      }, {} as T);

      return { data, error: null };
    } catch (error) {
      console.error(`[LambdaService] Prefetch error:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Clear cache for specific operation
   */
  clearOperationCache: (operationName: string) => {
    try {
      const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
      localStorage.removeItem(storageKey);
      console.log(
        `[LambdaService] Cleared cache for operation: ${operationName}`
      );
    } catch (error) {
      console.error(`[LambdaService] Error clearing operation cache:`, error);
    }
  },

  /**
   * Clear cache for multiple operations
   */
  clearOperationsCache: (operationNames: string[]) => {
    try {
      operationNames.forEach((operationName) => {
        const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
        localStorage.removeItem(storageKey);
      });
      console.log(
        `[LambdaService] Cleared cache for ${operationNames.length} operations`
      );
    } catch (error) {
      console.error(`[LambdaService] Error clearing operations cache:`, error);
    }
  },

  /**
   * Clear all operation caches
   */
  clearAllOperationCaches: () => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) =>
        key.startsWith(`${CACHE_KEY_PREFIX}-operation-`)
      );
      cacheKeys.forEach((key) => localStorage.removeItem(key));
      console.log(
        `[LambdaService] Cleared ${cacheKeys.length} operation caches`
      );
    } catch (error) {
      console.error(
        `[LambdaService] Error clearing all operation caches:`,
        error
      );
    }
  },

  /**
   * Get cache status for a specific operation
   */
  getOperationCacheStatus: (operationName: string) => {
    try {
      const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        const { timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const ttl = getOperationTTL(operationName);
        const isExpired = age >= ttl;

        return {
          exists: true,
          operationName,
          age: Math.round(age / 1000 / 60), // minutes
          ttl: Math.round(ttl / 1000 / 60), // minutes
          isExpired,
          expiresIn: Math.round((ttl - age) / 1000 / 60), // minutes until expiry
        };
      }

      return { exists: false, operationName };
    } catch (error) {
      console.error(
        `[LambdaService] Error getting operation cache status:`,
        error
      );
      return { exists: false, operationName, error: error as Error };
    }
  },

  /**
   * Get cache status for all operations
   */
  getAllOperationCacheStatus: () => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) =>
        key.startsWith(`${CACHE_KEY_PREFIX}-operation-`)
      );

      return cacheKeys.map((key) => {
        const operationName = key.replace(`${CACHE_KEY_PREFIX}-operation-`, "");
        return lambdaService.getOperationCacheStatus(operationName);
      });
    } catch (error) {
      console.error(
        `[LambdaService] Error getting all operation cache status:`,
        error
      );
      return [];
    }
  },

  /**
   * Get cache contents for a specific operation
   */
  getOperationCacheContents: (operationName: string) => {
    try {
      const storageKey = `${CACHE_KEY_PREFIX}-operation-${operationName}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const ttl = getOperationTTL(operationName);
        const isExpired = age >= ttl;

        return {
          data,
          key: storageKey,
          timestamp,
          age: Math.round(age / 1000 / 60), // minutes
          ttl: Math.round(ttl / 1000 / 60), // minutes
          isExpired,
          expiresIn: Math.round((ttl - age) / 1000 / 60), // minutes until expiry
        };
      }

      return null;
    } catch (error) {
      console.error(
        `[LambdaService] Error getting operation cache contents:`,
        error
      );
      return null;
    }
  },

  /**
   * Update TTL for an operation (runtime configuration)
   */
  updateOperationTTL: (operationName: string, ttl: number) => {
    // Update the cache configuration directly
    const config = getCacheConfig();
    config.operationTTLs[operationName] = ttl;
    localStorage.setItem("cacheConfig", JSON.stringify(config));
    console.log(
      `[LambdaService] Updated TTL for ${operationName}: ${Math.round(ttl / 1000 / 60)} minutes`
    );
  },

  /**
   * Clear Apollo cache
   */
  async clearCache(config?: ServiceConfig): Promise<void> {
    const client = config?.client || lambdaClient;
    if (!client) {
      console.error(
        "[LambdaService] Cannot clear cache: Apollo client not available"
      );
      return;
    }
    await client.clearStore();
    console.log("[LambdaService] Apollo cache cleared");
  },

  /**
   * Reset Apollo cache
   */
  async resetCache(config?: ServiceConfig): Promise<void> {
    const client = config?.client || lambdaClient;
    if (!client) {
      console.error(
        "[LambdaService] Cannot reset cache: Apollo client not available"
      );
      return;
    }
    await client.resetStore();
    console.log("[LambdaService] Apollo cache reset");
  },
};

/**
 * Create a service with custom configuration
 * Useful for different environments or clients
 */
export const createLambdaService = (config: ServiceConfig) => ({
  ...lambdaService,
  config,
});

// Export cache configuration utilities for external use
export { getCacheConfig };
