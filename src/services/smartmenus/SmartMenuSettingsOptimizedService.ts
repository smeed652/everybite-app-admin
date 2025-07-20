import { DocumentNode } from "@apollo/client";
import { SMARTMENU_SETTINGS_BASIC } from "../../features/dashboard/graphql/api/queries";
import { apiGraphQLClient } from "../../lib/api-graphql-apollo";
import { logger } from "../../lib/logger";

// Cache management constants
const SMARTMENU_CACHE_KEY = "smartmenu_last_fetch";
const SMARTMENU_CACHE_VERSION = "smartmenu_cache_v1";

export interface SmartMenuSettingsOptimized {
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
}

export interface QuarterlyMetricsOptimized {
  quarter: number;
  year: number;
  quarterLabel: string;
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
  locations: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface SmartMenuSettingsResult {
  smartMenus: SmartMenuSettingsOptimized[];
  quarterlyMetrics: QuarterlyMetricsOptimized[];
  cacheInfo: {
    lastFetch: number;
    cacheVersion: string;
    hasChanges: boolean;
  };
}

/**
 * Optimized SmartMenu Settings Service
 *
 * Uses the main API (api.everybite.com/graphql) for better performance
 * Implements timestamp-based cache invalidation
 * Provides immediate optimistic updates for better UX
 */
export class SmartMenuSettingsOptimizedService {
  private cacheVersion: string;
  private lastFetchTime: number;

  constructor() {
    this.cacheVersion = localStorage.getItem(SMARTMENU_CACHE_VERSION) || "1";
    this.lastFetchTime = parseInt(
      localStorage.getItem(SMARTMENU_CACHE_KEY) || "0"
    );
  }

  /**
   * Get SmartMenu settings with intelligent caching
   */
  async getSmartMenuSettings(): Promise<SmartMenuSettingsResult> {
    const startTime = Date.now();

    try {
      // Check if we need to invalidate cache
      const shouldInvalidate = this.shouldInvalidateCache();

      if (shouldInvalidate) {
        logger.info(
          "[SmartMenuSettingsOptimized] Cache invalidated, fetching fresh data"
        );
        this.invalidateCache();
      }

      // Fetch data from main API
      const result = await this.fetchFromMainAPI();

      // Update cache timestamp
      this.updateCacheTimestamp(result.smartMenus);

      const processingTime = Date.now() - startTime;

      logger.info("[SmartMenuSettingsOptimized] Data fetched successfully", {
        processingTime,
        smartMenuCount: result.smartMenus.length,
        cacheVersion: this.cacheVersion,
        lastFetch: this.lastFetchTime,
      });

      return {
        ...result,
        cacheInfo: {
          lastFetch: this.lastFetchTime,
          cacheVersion: this.cacheVersion,
          hasChanges: shouldInvalidate,
        },
      };
    } catch (error) {
      logger.error("[SmartMenuSettingsOptimized] Error fetching data", error);
      throw error;
    }
  }

  /**
   * Optimistically update a SmartMenu and invalidate cache
   */
  async updateSmartMenuOptimistically(
    widgetId: string,
    changes: Partial<SmartMenuSettingsOptimized>
  ): Promise<void> {
    try {
      // Immediately invalidate cache for this widget
      this.invalidateWidgetCache(widgetId);

      // Update cache version to force refresh
      this.incrementCacheVersion();

      logger.info(
        "[SmartMenuSettingsOptimized] Cache invalidated for widget update",
        {
          widgetId,
          changes: Object.keys(changes),
          cacheVersion: this.cacheVersion,
        }
      );
    } catch (error) {
      logger.error("[SmartMenuSettingsOptimized] Error updating cache", error);
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

    // For now, always fetch fresh data
    // In a real implementation, you might check with the server
    // if any data has changed since lastFetchTime
    return true;
  }

  /**
   * Fetch data from the main API
   */
  private async fetchFromMainAPI(): Promise<{
    smartMenus: SmartMenuSettingsOptimized[];
    quarterlyMetrics: QuarterlyMetricsOptimized[];
  }> {
    const query = this.getOptimizedQuery();

    const response = await apiGraphQLClient.query({
      query,
      fetchPolicy: "network-only", // Always fetch fresh data
      errorPolicy: "all",
    });

    if (response.errors) {
      logger.error(
        "[SmartMenuSettingsOptimized] GraphQL errors",
        response.errors
      );
      throw new Error(
        `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`
      );
    }

    const data = response.data;

    return {
      smartMenus: data.widgets || [],
      quarterlyMetrics: data.quarterlyMetrics || [],
    };
  }

  /**
   * Update cache timestamp based on latest updatedAt
   */
  private updateCacheTimestamp(smartMenus: SmartMenuSettingsOptimized[]): void {
    if (smartMenus.length === 0) return;

    const latestUpdate = Math.max(
      ...smartMenus.map((widget) => new Date(widget.updatedAt).getTime())
    );

    this.lastFetchTime = latestUpdate;
    localStorage.setItem(SMARTMENU_CACHE_KEY, latestUpdate.toString());
  }

  /**
   * Invalidate cache for a specific widget
   */
  private invalidateWidgetCache(widgetId: string): void {
    // In a real implementation, you might store widget-specific timestamps
    // For now, we'll invalidate the entire cache
    logger.info(
      `[SmartMenuSettingsOptimized] Invalidating cache for widget: ${widgetId}`
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
   * Get optimized GraphQL query for main API
   */
  private getOptimizedQuery(): DocumentNode {
    return SMARTMENU_SETTINGS_BASIC;
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
    this.lastFetchTime = 0;
    this.cacheVersion = "1";

    logger.info("[SmartMenuSettingsOptimized] Cache cleared");
  }
}
