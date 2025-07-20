import { useCallback, useEffect, useState } from "react";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
} from "../services/base/DataService";

export interface UseDataServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  metrics?: {
    totalCount: number;
    filteredCount: number;
    processingTime: number;
    cacheHit: boolean;
  };
}

export interface UseDataServiceOptions {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  defaultErrorHandler?: (error: Error) => void;
}

/**
 * Generic hook for using data services
 *
 * This hook provides a consistent interface for working with any service
 * that extends the base DataService class.
 */
export function useDataService<T, F = unknown>(
  service: DataService<T, F>,
  options: UseDataServiceOptions = {}
): UseDataServiceState<T> & {
  refetch: () => Promise<void>;
  getById: (id: string | number) => Promise<void>;
  getAll: (filters?: F) => Promise<void>;
  getFiltered: (filters: F) => Promise<void>;
  calculateMetrics: (data: T[]) => Promise<void>;
  getRollups: (groupBy: string[]) => Promise<void>;
  getTrends: (timeRange: { start: Date; end: Date }) => Promise<void>;
} {
  const [state, setState] = useState<UseDataServiceState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const serviceConfig: DataServiceConfig = {
    enableLogging: options.enableLogging,
    enableMetrics: options.enableMetrics,
    defaultErrorHandler: options.defaultErrorHandler,
  };

  // Configure service with options
  useEffect(() => {
    // Note: Service configuration should be done through constructor or service methods
    // This is a placeholder for future configuration options
  }, [service, serviceConfig]);

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
    (data: T, metrics?: BusinessLogicResult<T>["metrics"]) => {
      setState((prev) => ({
        ...prev,
        data,
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
    async <R>(
      method: () => Promise<BusinessLogicResult<R>>,
      transform?: (data: R) => T
    ) => {
      setLoading(true);
      try {
        const result = await method();
        const finalData = transform
          ? transform(result.data)
          : (result.data as unknown as T);
        setData(finalData, result.metrics);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        if (options.defaultErrorHandler && error instanceof Error) {
          options.defaultErrorHandler(error);
        }
      }
    },
    [setLoading, setData, setError, options.defaultErrorHandler]
  );

  const refetch = useCallback(async () => {
    if (state.data) {
      // Re-execute the last operation
      await getAll();
    }
  }, [state.data]);

  const getById = useCallback(
    async (id: string | number) => {
      await executeServiceMethod(
        () => service.getById(id),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  const getAll = useCallback(
    async (filters?: F) => {
      await executeServiceMethod(
        () => service.getAll(filters),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  const getFiltered = useCallback(
    async (filters: F) => {
      await executeServiceMethod(
        () => service.getFiltered(filters),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  const calculateMetrics = useCallback(
    async (data: T[]) => {
      await executeServiceMethod(
        () => service.calculateMetrics(data),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  const getRollups = useCallback(
    async (groupBy: string[]) => {
      await executeServiceMethod(
        () => service.getRollups(groupBy),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  const getTrends = useCallback(
    async (timeRange: { start: Date; end: Date }) => {
      await executeServiceMethod(
        () => service.getTrends(timeRange),
        (data) => data as T
      );
    },
    [executeServiceMethod, service]
  );

  return {
    ...state,
    refetch,
    getById,
    getAll,
    getFiltered,
    calculateMetrics,
    getRollups,
    getTrends,
  };
}
