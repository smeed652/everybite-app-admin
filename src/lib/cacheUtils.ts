import { getQueryTTL } from "../config/cache-config";
import { apiGraphQLClient } from "./api-graphql-apollo";
import { lambdaClient } from "./datawarehouse-lambda-apollo";

// Cache service types
export type CacheService = "datawarehouse-lambda" | "api-graphql";
export type CacheOperation = string;

// Cache status interface
export interface CacheStatus {
  service: CacheService;
  operation?: CacheOperation;
  age: number; // Age in milliseconds
  ttl: number; // TTL in milliseconds
  expiresAt: Date;
  isExpired: boolean;
  size: number; // Size in bytes
}

// Cache entry interface
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
  operation: string;
  service: CacheService;
}

// localStorage cache key prefix
const CACHE_PREFIX = "metabase-apollo-cache";

/**
 * Get cache key for service or operation
 */
function getCacheKey(
  service: CacheService,
  operation?: CacheOperation
): string {
  if (operation) {
    return `${CACHE_PREFIX}-${service}-${operation}`;
  }
  return `${CACHE_PREFIX}-${service}`;
}

/**
 * Get all cache keys for a service
 */
function getServiceCacheKeys(service: CacheService): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${CACHE_PREFIX}-${service}`)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Store data in localStorage cache
 */
function storeInCache(
  service: CacheService,
  operation: CacheOperation,
  data: unknown
): void {
  try {
    const ttl = getQueryTTL(operation);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      operation,
      service,
    };

    const key = getCacheKey(service, operation);
    localStorage.setItem(key, JSON.stringify(entry));

    console.log(`[CacheUtils] Stored in cache: ${key}, TTL: ${ttl}ms`);
  } catch (error) {
    console.error(`[CacheUtils] Error storing in cache:`, error);
  }
}

/**
 * Retrieve data from localStorage cache
 */
function getFromCache(
  service: CacheService,
  operation: CacheOperation
): unknown | null {
  try {
    const key = getCacheKey(service, operation);
    const cached = localStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl;

    if (isExpired) {
      localStorage.removeItem(key);
      console.log(`[CacheUtils] Cache expired: ${key}`);
      return null;
    }

    console.log(`[CacheUtils] Cache hit: ${key}, age: ${age}ms`);
    return entry.data;
  } catch (error) {
    console.error(`[CacheUtils] Error reading from cache:`, error);
    return null;
  }
}

/**
 * Clear specific operation cache
 */
function clearOperationCache(
  service: CacheService,
  operation: CacheOperation
): void {
  try {
    const key = getCacheKey(service, operation);
    localStorage.removeItem(key);

    // Also clear from Apollo cache
    const client =
      service === "datawarehouse-lambda" ? lambdaClient : apiGraphQLClient;
    if (client) {
      client.cache.evict({ fieldName: operation });
      client.cache.gc();
    }

    console.log(`[CacheUtils] Cleared operation cache: ${key}`);
  } catch (error) {
    console.error(`[CacheUtils] Error clearing operation cache:`, error);
  }
}

/**
 * Clear all cache for a specific service
 */
function clearServiceCache(service: CacheService): void {
  try {
    const keys = getServiceCacheKeys(service);
    keys.forEach((key) => localStorage.removeItem(key));

    // Also clear from Apollo cache
    const client =
      service === "datawarehouse-lambda" ? lambdaClient : apiGraphQLClient;
    if (client) {
      client.cache.reset();
    }

    console.log(
      `[CacheUtils] Cleared service cache: ${service}, ${keys.length} entries`
    );
  } catch (error) {
    console.error(`[CacheUtils] Error clearing service cache:`, error);
  }
}

/**
 * Clear only localStorage cache
 */
function clearCache(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => localStorage.removeItem(key));
    console.log(
      `[CacheUtils] Cleared localStorage cache: ${keys.length} entries`
    );
  } catch (error) {
    console.error(`[CacheUtils] Error clearing cache:`, error);
  }
}

/**
 * Get cache status for service or operation
 */
function getCacheStatus(
  service: CacheService,
  operation?: CacheOperation
): CacheStatus | null {
  try {
    const key = getCacheKey(service, operation);
    const cached = localStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl;
    const expiresAt = new Date(entry.timestamp + entry.ttl);
    const size = new Blob([cached]).size;

    return {
      service,
      operation,
      age,
      ttl: entry.ttl,
      expiresAt,
      isExpired,
      size,
    };
  } catch (error) {
    console.error(`[CacheUtils] Error getting cache status:`, error);
    return null;
  }
}

/**
 * Smart refresh - clear cache and refetch active queries
 */
async function smartRefresh(): Promise<void> {
  try {
    console.log(`[CacheUtils] Starting smart refresh...`);

    // Clear localStorage cache
    clearCache();

    // Clear Apollo caches
    if (lambdaClient) {
      lambdaClient.cache.reset();
    }
    if (apiGraphQLClient) {
      apiGraphQLClient.cache.reset();
    }

    // Refetch active queries
    if (lambdaClient) {
      await lambdaClient.refetchQueries({
        include: "active",
      });
    }
    if (apiGraphQLClient) {
      await apiGraphQLClient.refetchQueries({
        include: "active",
      });
    }

    console.log(`[CacheUtils] Smart refresh completed`);
  } catch (error) {
    console.error(`[CacheUtils] Error during smart refresh:`, error);
  }
}

/**
 * Get all cache statuses
 */
function getAllCacheStatuses(): CacheStatus[] {
  const statuses: CacheStatus[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          const status = getCacheStatus(entry.service, entry.operation);
          if (status) {
            statuses.push(status);
          }
        }
      }
    }
  } catch (error) {
    console.error(`[CacheUtils] Error getting all cache statuses:`, error);
  }

  return statuses;
}

// Export cache utilities
export const cacheUtils = {
  smartRefresh,
  clearServiceCache,
  clearOperationCache,
  clearCache,
  getCacheStatus,
  getAllCacheStatuses,
  storeInCache,
  getFromCache,
};

// Export individual functions for direct use
export {
  clearCache,
  clearOperationCache,
  clearServiceCache,
  getAllCacheStatuses,
  getCacheStatus,
  getFromCache,
  smartRefresh,
  storeInCache,
};
