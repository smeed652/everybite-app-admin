import { useCallback, useEffect, useState } from "react";
import {
  WidgetAnalytics,
  WidgetAnalyticsService,
  WidgetFilters,
} from "../services/widgets/WidgetAnalyticsService";

export interface UseWidgetAnalyticsOptions {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  defaultErrorHandler?: (error: Error) => void;
  autoLoad?: boolean;
}

export interface UseWidgetAnalyticsState {
  widgets: WidgetAnalytics[] | null;
  loading: boolean;
  error: string | null;
  metrics?: {
    totalCount: number;
    filteredCount: number;
    processingTime: number;
    cacheHit: boolean;
  };
}

/**
 * Hook for widget analytics operations
 *
 * Provides a convenient interface for working with widget analytics data
 * using the WidgetAnalyticsService.
 */
export function useWidgetAnalytics(options: UseWidgetAnalyticsOptions = {}) {
  const [state, setState] = useState<UseWidgetAnalyticsState>({
    widgets: null,
    loading: false,
    error: null,
  });

  const service = new WidgetAnalyticsService({
    enableLogging: options.enableLogging,
    enableMetrics: options.enableMetrics,
    defaultErrorHandler: options.defaultErrorHandler,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading,
      error: loading ? null : prev.error,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const setData = useCallback(
    (
      widgets: WidgetAnalytics[],
      metrics?: {
        totalCount: number;
        filteredCount: number;
        processingTime: number;
        cacheHit: boolean;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        widgets,
        loading: false,
        error: null,
        metrics: metrics
          ? {
              totalCount: metrics.totalCount,
              filteredCount: metrics.filteredCount,
              processingTime: metrics.processingTime,
              cacheHit: metrics.cacheHit,
            }
          : prev.metrics,
      }));
    },
    []
  );

  const executeServiceMethod = useCallback(
    async <T>(
      method: () => Promise<{
        data: T;
        metrics?: {
          totalCount: number;
          filteredCount: number;
          processingTime: number;
          cacheHit: boolean;
        };
      }>
    ) => {
      setLoading(true);
      try {
        const result = await method();
        setData(result.data as WidgetAnalytics[], result.metrics);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        if (options.defaultErrorHandler && error instanceof Error) {
          options.defaultErrorHandler(error);
        }
        throw error;
      }
    },
    [setLoading, setData, setError, options.defaultErrorHandler]
  );

  // Auto-load widgets if requested
  useEffect(() => {
    if (options.autoLoad && !state.widgets && !state.loading) {
      getAll();
    }
  }, [options.autoLoad, state.widgets, state.loading]);

  const getAll = useCallback(
    async (filters?: WidgetFilters) => {
      return executeServiceMethod(() => service.getAll(filters));
    },
    [executeServiceMethod, service]
  );

  const getFiltered = useCallback(
    async (filters: WidgetFilters) => {
      return executeServiceMethod(() => service.getFiltered(filters));
    },
    [executeServiceMethod, service]
  );

  const getById = useCallback(
    async (id: string | number) => {
      try {
        const result = await service.getById(id);
        return result;
      } catch (error) {
        console.error("Failed to get widget by ID:", error);
        throw error;
      }
    },
    [service]
  );

  const getDashboardAnalytics = useCallback(async () => {
    try {
      const result = await service.getDashboardAnalytics();
      return result;
    } catch (error) {
      console.error("Failed to get dashboard analytics:", error);
      throw error;
    }
  }, [service]);

  const getWidgetTrends = useCallback(
    async (timeRange: { start: Date; end: Date }) => {
      try {
        const result = await service.getWidgetTrends(timeRange);
        return result;
      } catch (error) {
        console.error("Failed to get widget trends:", error);
        throw error;
      }
    },
    [service]
  );

  const getByLayout = useCallback(
    async (layout: string) => {
      try {
        const result = await service.getByLayout(layout);
        return result;
      } catch (error) {
        console.error("Failed to get widgets by layout:", error);
        throw error;
      }
    },
    [service]
  );

  const getActiveWidgets = useCallback(async () => {
    try {
      const result = await service.getActiveWidgets();
      return result;
    } catch (error) {
      console.error("Failed to get active widgets:", error);
      throw error;
    }
  }, [service]);

  const getWidgetsWithFeature = useCallback(
    async (feature: "images" | "orderButton" | "byo") => {
      try {
        const result = await service.getWidgetsWithFeature(feature);
        return result;
      } catch (error) {
        console.error("Failed to get widgets with feature:", error);
        throw error;
      }
    },
    [service]
  );

  const calculateMetrics = useCallback(
    async (data: WidgetAnalytics[]) => {
      try {
        const result = await service.calculateMetrics(data);
        return result;
      } catch (error) {
        console.error("Failed to calculate metrics:", error);
        throw error;
      }
    },
    [service]
  );

  const getRollups = useCallback(
    async (groupBy: string[]) => {
      try {
        const result = await service.getRollups(groupBy);
        return result;
      } catch (error) {
        console.error("Failed to get rollups:", error);
        throw error;
      }
    },
    [service]
  );

  const getTrends = useCallback(
    async (timeRange: { start: Date; end: Date }) => {
      try {
        const result = await service.getTrends(timeRange);
        return result;
      } catch (error) {
        console.error("Failed to get trends:", error);
        throw error;
      }
    },
    [service]
  );

  const refetch = useCallback(async () => {
    if (state.widgets) {
      await getAll();
    }
  }, [state.widgets, getAll]);

  return {
    // Data state
    ...state,

    // Generic methods
    getAll,
    getFiltered,
    getById,
    calculateMetrics,
    getRollups,
    getTrends,
    refetch,

    // Widget-specific methods
    getDashboardAnalytics,
    getWidgetTrends,
    getByLayout,
    getActiveWidgets,
    getWidgetsWithFeature,

    // Service instance for advanced usage
    service,
  };
}
