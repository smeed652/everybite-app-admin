import { SMARTMENU_SETTINGS_BASIC } from "../../features/dashboard/graphql/api/queries";
import { SMARTMENU_SETTINGS } from "../../features/dashboard/graphql/lambda/queries/smartmenu-settings";
import { apiGraphQLClient } from "../../lib/api-graphql-apollo";
import { lambdaClient } from "../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../lib/logger";

// Cache management constants
const SMARTMENU_CACHE_KEY = "smartmenu_hybrid_last_fetch";
const SMARTMENU_CACHE_VERSION = "smartmenu_hybrid_cache_v1";

export interface SmartMenuSettingsHybrid {
  // Core identification
  id: string;
  name: string;
  slug: string;

  // Timestamps for cache invalidation
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;

  // Essential metrics
  numberOfLocations?: number;
  numberOfLocationsSource?: string;

  // Feature adoption
  displayImages: boolean;
  layout: string;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;

  // Chain classifications from Lambda datawarehouse
  chain_nra_classifications?: {
    nra_classification: string;
  }[];
  chain_menu_classifications?: {
    menu_type: string;
  }[];
  chain_cuisine_classifications?: {
    cuisine_type: string;
  }[];

  // Essential settings
  primaryBrandColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  orderUrl?: string;
  supportedAllergens?: string[];

  // CTA flags
  displaySoftSignUp?: boolean;
  displayNotifyMeBanner?: boolean;
  displayGiveFeedbackBanner?: boolean;
  displayFeedbackButton?: boolean;
  displayDishDetailsLink?: boolean;

  // Analytics data from Lambda (if available)
  analytics?: {
    totalOrders?: number;
    totalDinerVisits?: number;
    lastOrderDate?: string;
  };
}

export interface QuarterlyMetricsHybrid {
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
}

export interface SmartMenuSettingsHybridResult {
  smartMenus: SmartMenuSettingsHybrid[];
  quarterlyMetrics: QuarterlyMetricsHybrid[];
  performanceMetrics: {
    mainApiTime: number;
    lambdaTime: number;
    totalTime: number;
    cacheHit: boolean;
  };
  cacheInfo: {
    lastFetch: number;
    cacheVersion: string;
    hasChanges: boolean;
  };
}

/**
 * Hybrid SmartMenu Settings Service
 *
 * Combines the main API (api.everybite.com/graphql) for basic widget data
 * with Lambda for analytics data to provide the best of both worlds
 * Implements timestamp-based cache invalidation
 * Provides performance comparison between the two approaches
 */
export class SmartMenuSettingsHybridService {
  private cacheVersion: string;
  private lastFetchTime: number;

  constructor() {
    this.cacheVersion = localStorage.getItem(SMARTMENU_CACHE_VERSION) || "1";
    this.lastFetchTime = parseInt(
      localStorage.getItem(SMARTMENU_CACHE_KEY) || "0"
    );
  }

  /**
   * Get SmartMenu settings using hybrid approach
   */
  async getSmartMenuSettings(): Promise<SmartMenuSettingsHybridResult> {
    const startTime = Date.now();

    try {
      const shouldInvalidate = this.shouldInvalidateCache();

      if (!shouldInvalidate) {
        // Try to get cached data
        const cachedData = this.getCachedData();
        if (cachedData) {
          logger.info("[SmartMenuSettingsHybrid] Serving cached data", {
            cacheAge: Date.now() - this.lastFetchTime,
            smartMenuCount: cachedData.smartMenus.length,
          });

          return {
            ...cachedData,
            performanceMetrics: {
              mainApiTime: 0,
              lambdaTime: 0,
              totalTime: 0,
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
          "[SmartMenuSettingsHybrid] Cache invalidated, fetching fresh data"
        );
        this.invalidateCache();
      }

      // Fetch data from both sources in parallel
      const [mainApiResult, lambdaResult] = await Promise.allSettled([
        this.fetchFromMainAPI(),
        this.fetchFromLambda(),
      ]);

      // Process results
      const smartMenus = this.mergeResults(mainApiResult);
      const quarterlyMetrics = this.extractQuarterlyMetrics(lambdaResult);

      // Update cache timestamp and store data
      this.updateCacheTimestamp();
      this.storeCachedData(smartMenus, quarterlyMetrics);

      const totalTime = Date.now() - startTime;

      logger.info("[SmartMenuSettingsHybrid] Data fetched successfully", {
        totalTime,
        smartMenuCount: smartMenus.length,
        cacheVersion: this.cacheVersion,
        lastFetch: this.lastFetchTime,
        mainApiSuccess: mainApiResult.status === "fulfilled",
        lambdaSuccess: lambdaResult.status === "fulfilled",
      });

      return {
        smartMenus,
        quarterlyMetrics,
        performanceMetrics: {
          mainApiTime:
            mainApiResult.status === "fulfilled" ? mainApiResult.value.time : 0,
          lambdaTime:
            lambdaResult.status === "fulfilled" ? lambdaResult.value.time : 0,
          totalTime,
          cacheHit: false,
        },
        cacheInfo: {
          lastFetch: this.lastFetchTime,
          cacheVersion: this.cacheVersion,
          hasChanges: shouldInvalidate,
        },
      };
    } catch (error) {
      logger.error("[SmartMenuSettingsHybrid] Error fetching data", error);
      throw error;
    }
  }

  /**
   * Optimistically update a SmartMenu and invalidate cache
   */
  async updateSmartMenuOptimistically(
    widgetId: string,
    changes: Partial<SmartMenuSettingsHybrid>
  ): Promise<void> {
    try {
      // Immediately invalidate cache for this widget
      this.invalidateWidgetCache(widgetId);

      // Update cache version to force refresh
      this.incrementCacheVersion();

      logger.info(
        "[SmartMenuSettingsHybrid] Cache invalidated for widget update",
        {
          widgetId,
          changes: Object.keys(changes),
          cacheVersion: this.cacheVersion,
        }
      );
    } catch (error) {
      logger.error("[SmartMenuSettingsHybrid] Error updating cache", error);
      throw error;
    }
  }

  /**
   * Check if cache should be invalidated based on timestamps
   */
  private shouldInvalidateCache(): boolean {
    // If no cache exists, we need to fetch
    if (this.lastFetchTime === 0) {
      return true;
    }

    // Check if cache version has changed
    const storedVersion = localStorage.getItem(SMARTMENU_CACHE_VERSION);
    if (storedVersion !== this.cacheVersion) {
      return true;
    }

    // Check if cache is older than 5 minutes (300,000 ms)
    const cacheAge = Date.now() - this.lastFetchTime;
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    if (cacheAge > CACHE_TTL) {
      return true;
    }

    // Use cached data
    return false;
  }

  /**
   * Fetch data from the main API
   */
  private async fetchFromMainAPI(): Promise<{
    smartMenus: SmartMenuSettingsHybrid[];
    time: number;
  }> {
    const startTime = Date.now();

    try {
      const response = await apiGraphQLClient.query({
        query: SMARTMENU_SETTINGS_BASIC,
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });

      if (response.errors) {
        logger.error(
          "[SmartMenuSettingsHybrid] Main API GraphQL errors",
          response.errors
        );
        throw new Error(
          `Main API GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`
        );
      }

      const time = Date.now() - startTime;

      return {
        smartMenus: response.data.widgets || [],
        time,
      };
    } catch (error) {
      logger.error("[SmartMenuSettingsHybrid] Main API fetch error", error);
      throw error;
    }
  }

  /**
   * Fetch analytics data from Lambda
   */
  private async fetchFromLambda(): Promise<{
    quarterlyMetrics: QuarterlyMetricsHybrid[];
    time: number;
  }> {
    const startTime = Date.now();

    try {
      if (!lambdaClient) {
        throw new Error("Lambda client not initialized");
      }

      const response = await lambdaClient.query({
        query: SMARTMENU_SETTINGS,
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });

      if (response.errors) {
        logger.error(
          "[SmartMenuSettingsHybrid] Lambda GraphQL errors",
          response.errors
        );
        throw new Error(
          `Lambda GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`
        );
      }

      const time = Date.now() - startTime;

      return {
        quarterlyMetrics: response.data.quarterlyMetrics || [],
        time,
      };
    } catch (error) {
      logger.error("[SmartMenuSettingsHybrid] Lambda fetch error", error);
      throw error;
    }
  }

  /**
   * Merge results from both APIs
   */
  private mergeResults(
    mainApiResult: PromiseSettledResult<{
      smartMenus: SmartMenuSettingsHybrid[];
      time: number;
    }>
  ): SmartMenuSettingsHybrid[] {
    if (mainApiResult.status === "rejected") {
      logger.warn(
        "[SmartMenuSettingsHybrid] Main API failed, returning empty array"
      );
      return [];
    }

    return mainApiResult.value.smartMenus;
  }

  /**
   * Extract quarterly metrics from Lambda result
   */
  private extractQuarterlyMetrics(
    lambdaResult: PromiseSettledResult<{
      quarterlyMetrics: QuarterlyMetricsHybrid[];
      time: number;
    }>
  ): QuarterlyMetricsHybrid[] {
    if (lambdaResult.status === "rejected") {
      logger.warn(
        "[SmartMenuSettingsHybrid] Lambda failed, returning empty quarterly metrics"
      );
      return [];
    }

    return lambdaResult.value.quarterlyMetrics;
  }

  /**
   * Update cache timestamp to current time
   */
  private updateCacheTimestamp(): void {
    // Set cache timestamp to current time, not the latest updatedAt
    this.lastFetchTime = Date.now();
    localStorage.setItem(SMARTMENU_CACHE_KEY, this.lastFetchTime.toString());
  }

  /**
   * Invalidate cache for a specific widget
   */
  private invalidateWidgetCache(widgetId: string): void {
    logger.info(
      `[SmartMenuSettingsHybrid] Invalidating cache for widget: ${widgetId}`
    );
    this.invalidateCache();
  }

  /**
   * Invalidate entire cache
   */
  private invalidateCache(): void {
    localStorage.removeItem(SMARTMENU_CACHE_KEY);
    this.lastFetchTime = 0;
  }

  /**
   * Increment cache version to force refresh
   */
  private incrementCacheVersion(): void {
    const currentVersion = parseInt(this.cacheVersion) || 1;
    this.cacheVersion = (currentVersion + 1).toString();
    localStorage.setItem(SMARTMENU_CACHE_VERSION, this.cacheVersion);
  }

  /**
   * Get cached data
   */
  private getCachedData(): SmartMenuSettingsHybridResult | null {
    try {
      const cachedSmartMenus = localStorage.getItem(
        "smartmenu_hybrid_smartMenus"
      );
      const cachedQuarterlyMetrics = localStorage.getItem(
        "smartmenu_hybrid_quarterlyMetrics"
      );
      const cachedCacheVersion = localStorage.getItem(SMARTMENU_CACHE_VERSION);
      const cachedLastFetch = parseInt(
        localStorage.getItem(SMARTMENU_CACHE_KEY) || "0"
      );

      if (
        cachedSmartMenus &&
        cachedQuarterlyMetrics &&
        cachedCacheVersion &&
        cachedLastFetch > 0
      ) {
        const smartMenus = JSON.parse(cachedSmartMenus);
        const quarterlyMetrics = JSON.parse(cachedQuarterlyMetrics);

        // Validate that we have valid data
        if (Array.isArray(smartMenus) && Array.isArray(quarterlyMetrics)) {
          return {
            smartMenus,
            quarterlyMetrics,
            performanceMetrics: {
              mainApiTime: 0,
              lambdaTime: 0,
              totalTime: 0,
              cacheHit: true,
            },
            cacheInfo: {
              lastFetch: cachedLastFetch,
              cacheVersion: cachedCacheVersion,
              hasChanges: false,
            },
          };
        }
      }
    } catch (error) {
      logger.warn("[SmartMenuSettingsHybrid] Error reading cached data", error);
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private storeCachedData(
    smartMenus: SmartMenuSettingsHybrid[],
    quarterlyMetrics: QuarterlyMetricsHybrid[]
  ): void {
    try {
      localStorage.setItem(
        "smartmenu_hybrid_smartMenus",
        JSON.stringify(smartMenus)
      );
      localStorage.setItem(
        "smartmenu_hybrid_quarterlyMetrics",
        JSON.stringify(quarterlyMetrics)
      );
      localStorage.setItem(SMARTMENU_CACHE_VERSION, this.cacheVersion);
      localStorage.setItem(SMARTMENU_CACHE_KEY, this.lastFetchTime.toString());
    } catch (error) {
      logger.warn("[SmartMenuSettingsHybrid] Error storing cached data", error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    lastFetch: number;
    cacheVersion: string;
    cacheAge: number;
  } {
    const now = Date.now();
    const cacheAge = this.lastFetchTime > 0 ? now - this.lastFetchTime : 0;

    return {
      lastFetch: this.lastFetchTime,
      cacheVersion: this.cacheVersion,
      cacheAge,
    };
  }

  /**
   * Clear all cache data
   */
  clearCache(): void {
    localStorage.removeItem(SMARTMENU_CACHE_KEY);
    localStorage.removeItem(SMARTMENU_CACHE_VERSION);
    localStorage.removeItem("smartmenu_hybrid_smartMenus");
    localStorage.removeItem("smartmenu_hybrid_quarterlyMetrics");
    this.lastFetchTime = 0;
    this.cacheVersion = "1";

    logger.info("[SmartMenuSettingsHybrid] Cache cleared");
  }

  /**
   * Compare performance between main API and Lambda
   */
  async comparePerformance(): Promise<{
    mainApiTime: number;
    lambdaTime: number;
    recommendation: string;
  }> {
    const startTime = Date.now();

    try {
      // Test main API performance
      const mainApiStart = Date.now();
      await this.fetchFromMainAPI();
      const mainApiTime = Date.now() - mainApiStart;

      // Test Lambda performance
      const lambdaStart = Date.now();
      await this.fetchFromLambda();
      const lambdaTime = Date.now() - lambdaStart;

      const totalTime = Date.now() - startTime;

      let recommendation = "Use hybrid approach";
      if (mainApiTime < lambdaTime * 0.5) {
        recommendation = "Use main API only";
      } else if (lambdaTime < mainApiTime * 0.5) {
        recommendation = "Use Lambda only";
      }

      logger.info("[SmartMenuSettingsHybrid] Performance comparison", {
        mainApiTime,
        lambdaTime,
        totalTime,
        recommendation,
      });

      return {
        mainApiTime,
        lambdaTime,
        recommendation,
      };
    } catch (error) {
      logger.error(
        "[SmartMenuSettingsHybrid] Performance comparison failed",
        error
      );
      throw error;
    }
  }
}
