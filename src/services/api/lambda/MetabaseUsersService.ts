import { METABASE_USERS_QUERY } from "../../../components/cache/constants";
import { getCacheConfig } from "../../../config/cache-config";
import { lambdaClient } from "../../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../../lib/logger";

// Cache management constants
const METABASE_USERS_CACHE_KEY = "metabase_users_last_fetch";
const METABASE_USERS_CACHE_VERSION = "metabase_users_cache_v1";

export interface MetabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  dateJoined: string;
  lastLogin: string;
  isActive: boolean;
  isSuperuser: boolean;
  isQbnewb: boolean;
  locale: string;
  ssoSource: string;
}

export interface MetabaseUsersResult {
  users: MetabaseUser[];
  total: number;
  performanceMetrics: {
    fetchTime: number;
    cacheHit: boolean;
  };
  cacheInfo: {
    lastFetch: number;
    cacheVersion: string;
    hasChanges: boolean;
  };
}

/**
 * Metabase Users Service
 *
 * Fetches Metabase users with proper TTL-based caching
 * Uses the cache configuration to determine TTL
 */
export class MetabaseUsersService {
  private cacheVersion: string;
  private lastFetchTime: number;

  constructor() {
    this.cacheVersion =
      localStorage.getItem(METABASE_USERS_CACHE_VERSION) || "1";
    this.lastFetchTime = parseInt(
      localStorage.getItem(METABASE_USERS_CACHE_KEY) || "0"
    );
  }

  /**
   * Get Metabase users with proper caching
   */
  async getMetabaseUsers(
    page: number = 1,
    pageSize: number = 50
  ): Promise<MetabaseUsersResult> {
    const startTime = Date.now();

    try {
      const shouldInvalidate = this.shouldInvalidateCache();

      if (!shouldInvalidate) {
        // Try to get cached data
        const cachedData = this.getCachedData();
        if (cachedData) {
          logger.info("[MetabaseUsersService] Serving cached data", {
            cacheAge: Date.now() - this.lastFetchTime,
            userCount: cachedData.users.length,
          });

          return {
            ...cachedData,
            performanceMetrics: {
              fetchTime: 0,
              cacheHit: true,
            },
            cacheInfo: {
              lastFetch: this.lastFetchTime,
              cacheVersion: this.cacheVersion,
              hasChanges: false,
            },
          };
        }
      }

      if (shouldInvalidate) {
        logger.info(
          "[MetabaseUsersService] Cache invalidated, fetching fresh data"
        );
        this.invalidateCache();
      }

      // Fetch fresh data
      const result = await this.fetchFromLambda(page, pageSize);

      // Update cache timestamp and store data
      this.updateCacheTimestamp();
      this.storeCachedData(result);

      const fetchTime = Date.now() - startTime;

      logger.info("[MetabaseUsersService] Data fetched successfully", {
        fetchTime,
        userCount: result.users.length,
        cacheVersion: this.cacheVersion,
        lastFetch: this.lastFetchTime,
      });

      return {
        ...result,
        performanceMetrics: {
          fetchTime,
          cacheHit: false,
        },
        cacheInfo: {
          lastFetch: this.lastFetchTime,
          cacheVersion: this.cacheVersion,
          hasChanges: true,
        },
      };
    } catch (error) {
      logger.error("[MetabaseUsersService] Fetch error", error);
      throw error;
    }
  }

  /**
   * Check if cache should be invalidated based on TTL
   */
  private shouldInvalidateCache(): boolean {
    // If no cache exists, we need to fetch
    if (this.lastFetchTime === 0) {
      return true;
    }

    // Check if cache version has changed
    const storedVersion = localStorage.getItem(METABASE_USERS_CACHE_VERSION);
    if (storedVersion !== this.cacheVersion) {
      return true;
    }

    // Get TTL from cache configuration
    const cacheConfig = getCacheConfig();
    const ttl = cacheConfig.operationTTLs?.MetabaseUsers || cacheConfig.ttl;

    // Check if cache is older than TTL
    const cacheAge = Date.now() - this.lastFetchTime;

    if (cacheAge > ttl) {
      logger.info("[MetabaseUsersService] Cache expired", {
        cacheAge,
        ttl,
        cacheAgeMinutes: Math.round(cacheAge / (1000 * 60)),
        ttlMinutes: Math.round(ttl / (1000 * 60)),
      });
      return true;
    }

    // Use cached data
    return false;
  }

  /**
   * Fetch data from Lambda
   */
  private async fetchFromLambda(
    page: number,
    pageSize: number
  ): Promise<{
    users: MetabaseUser[];
    total: number;
  }> {
    if (!lambdaClient) {
      throw new Error("Lambda client not initialized");
    }

    const response = await lambdaClient.query({
      query: METABASE_USERS_QUERY,
      variables: { page, pageSize },
      fetchPolicy: "network-only",
      errorPolicy: "all",
    });

    if (response.errors) {
      logger.error(
        "[MetabaseUsersService] Lambda GraphQL errors",
        response.errors
      );
      throw new Error(
        `Lambda GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`
      );
    }

    return {
      users: response.data.metabaseUsers?.users || [],
      total: response.data.metabaseUsers?.total || 0,
    };
  }

  /**
   * Update cache timestamp to current time
   */
  private updateCacheTimestamp(): void {
    this.lastFetchTime = Date.now();
    localStorage.setItem(
      METABASE_USERS_CACHE_KEY,
      this.lastFetchTime.toString()
    );
  }

  /**
   * Invalidate entire cache
   */
  private invalidateCache(): void {
    localStorage.removeItem(METABASE_USERS_CACHE_KEY);
    this.lastFetchTime = 0;
  }

  /**
   * Get cached data
   */
  private getCachedData(): { users: MetabaseUser[]; total: number } | null {
    try {
      const cachedUsers = localStorage.getItem("metabase_users_data");
      const cachedCacheVersion = localStorage.getItem(
        METABASE_USERS_CACHE_VERSION
      );
      const cachedLastFetch = parseInt(
        localStorage.getItem(METABASE_USERS_CACHE_KEY) || "0"
      );

      if (cachedUsers && cachedCacheVersion && cachedLastFetch > 0) {
        const parsedUsers = JSON.parse(cachedUsers);
        return {
          users: parsedUsers.users || [],
          total: parsedUsers.total || 0,
        };
      }
    } catch (error) {
      logger.error("[MetabaseUsersService] Error reading cached data", error);
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private storeCachedData(data: {
    users: MetabaseUser[];
    total: number;
  }): void {
    try {
      localStorage.setItem("metabase_users_data", JSON.stringify(data));
    } catch (error) {
      logger.error("[MetabaseUsersService] Error storing cached data", error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    lastFetch: number;
    cacheVersion: string;
    cacheAge: number;
  } {
    return {
      lastFetch: this.lastFetchTime,
      cacheVersion: this.cacheVersion,
      cacheAge: Date.now() - this.lastFetchTime,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    localStorage.removeItem("metabase_users_data");
    localStorage.removeItem(METABASE_USERS_CACHE_KEY);
    this.lastFetchTime = 0;
    logger.info("[MetabaseUsersService] Cache cleared");
  }
}
