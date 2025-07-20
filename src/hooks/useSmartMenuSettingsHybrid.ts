import { useCallback, useEffect, useState } from "react";
import { logger } from "../lib/logger";
import {
  SmartMenuSettingsHybridResult,
  SmartMenuSettingsHybridService,
} from "../services/smartmenus/SmartMenuSettingsHybridService";

/**
 * Hook for using the hybrid SmartMenu settings service
 * Combines main API and Lambda data with intelligent caching
 */
export function useSmartMenuSettingsHybrid() {
  const [data, setData] = useState<SmartMenuSettingsHybridResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [service] = useState(() => new SmartMenuSettingsHybridService());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info("[useSmartMenuSettingsHybrid] Fetching SmartMenu data");
      const result = await service.getSmartMenuSettings();

      setData(result);

      logger.info("[useSmartMenuSettingsHybrid] Data fetched successfully", {
        smartMenuCount: result.smartMenus.length,
        performanceMetrics: result.performanceMetrics,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      logger.error("[useSmartMenuSettingsHybrid] Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateSmartMenuOptimistically = useCallback(
    async (widgetId: string, changes: any) => {
      try {
        await service.updateSmartMenuOptimistically(widgetId, changes);

        // Refetch data to get the latest changes
        await fetchData();

        logger.info(
          "[useSmartMenuSettingsHybrid] SmartMenu updated optimistically",
          {
            widgetId,
            changes: Object.keys(changes),
          }
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        logger.error(
          "[useSmartMenuSettingsHybrid] Error updating SmartMenu",
          error
        );
      }
    },
    [service, fetchData]
  );

  const comparePerformance = useCallback(async () => {
    try {
      const result = await service.comparePerformance();

      logger.info(
        "[useSmartMenuSettingsHybrid] Performance comparison",
        result
      );

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      logger.error(
        "[useSmartMenuSettingsHybrid] Error comparing performance",
        error
      );
      throw error;
    }
  }, [service]);

  const clearCache = useCallback(() => {
    service.clearCache();
    logger.info("[useSmartMenuSettingsHybrid] Cache cleared");
  }, [service]);

  const getCacheStats = useCallback(() => {
    return service.getCacheStats();
  }, [service]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateSmartMenuOptimistically,
    comparePerformance,
    clearCache,
    getCacheStats,
  };
}
