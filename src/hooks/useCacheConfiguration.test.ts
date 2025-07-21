import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the external dependencies
vi.mock("../config/cache-config", () => ({
  getCacheConfig: vi.fn(),
  setCacheConfig: vi.fn(),
}));

vi.mock("../lib/datawarehouse-lambda-apollo", () => ({
  reinitializeLambdaClient: vi.fn(),
}));

vi.mock("../services/base/lambdaService", () => ({
  lambdaService: {
    updateOperationTTL: vi.fn(),
  },
}));

// Import after mocks
import { getCacheConfig, setCacheConfig } from "../config/cache-config";
import { reinitializeLambdaClient } from "../lib/datawarehouse-lambda-apollo";
import { useCacheConfiguration } from "./useCacheConfiguration";

const mockGetCacheConfig = getCacheConfig as ReturnType<typeof vi.fn>;
const mockSetCacheConfig = setCacheConfig as ReturnType<typeof vi.fn>;
const mockReinitializeLambdaClient = reinitializeLambdaClient as ReturnType<
  typeof vi.fn
>;

describe("useCacheConfiguration", () => {
  const defaultConfig = {
    enableCaching: true,
    ttl: 86400000, // 24 hours in ms
    scheduledRefresh: {
      enabled: true,
      time: "06:00",
      timezone: "America/Los_Angeles",
    },
    storage: {
      prefix: "metabase-apollo-cache",
      persistence: true,
    },
    operationTTLs: {
      GetWidget: 0,
      GetWidgets: 0,
      GetSmartMenus: 0,
      GetUser: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCacheConfig.mockReturnValue(defaultConfig);
    mockSetCacheConfig.mockResolvedValue(undefined);
    mockReinitializeLambdaClient.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("should initialize with configuration from cache config", () => {
      const { result } = renderHook(() => useCacheConfiguration());

      expect(result.current.cacheConfig).toEqual({
        enableCaching: true,
        scheduledRefreshEnabled: true,
        scheduledRefreshTime: "06:00",
        scheduledRefreshTimezone: "America/Los_Angeles",
        cacheTTLHours: 24,
        operationTTLs: {
          GetWidget: 0,
          GetWidgets: 0,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      });
      expect(result.current.originalConfig).toEqual(result.current.cacheConfig);
      expect(result.current.isSaving).toBe(false);
      expect(mockGetCacheConfig).toHaveBeenCalledTimes(1);
    });

    it("should handle operationTTLs as JSON string", () => {
      const configWithStringTTLs = {
        ...defaultConfig,
        operationTTLs: JSON.stringify({
          GetWidget: 30,
          GetWidgets: 60,
        }),
      };
      mockGetCacheConfig.mockReturnValue(configWithStringTTLs);

      const { result } = renderHook(() => useCacheConfiguration());

      expect(result.current.cacheConfig.operationTTLs).toEqual({
        GetWidget: 30,
        GetWidgets: 60,
        GetSmartMenus: 0,
        GetUser: 0,
      });
    });
  });

  describe("state management", () => {
    it("should update cache config state", () => {
      const { result } = renderHook(() => useCacheConfiguration());

      const newConfig = {
        enableCaching: false,
        scheduledRefreshEnabled: false,
        scheduledRefreshTime: "12:00",
        scheduledRefreshTimezone: "UTC",
        cacheTTLHours: 12,
        operationTTLs: {
          GetWidget: 30,
          GetWidgets: 60,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      };

      act(() => {
        result.current.setCacheConfigState(newConfig);
      });

      expect(result.current.cacheConfig).toEqual(newConfig);
    });
  });

  describe("change detection", () => {
    it("should detect changes in configuration", () => {
      const { result } = renderHook(() => useCacheConfiguration());

      expect(result.current.hasChanges()).toBe(false);

      act(() => {
        result.current.setCacheConfigState({
          ...result.current.cacheConfig,
          enableCaching: false,
        });
      });

      expect(result.current.hasChanges()).toBe(true);
    });

    it("should not detect changes when config is reverted", () => {
      const { result } = renderHook(() => useCacheConfiguration());

      const originalConfig = result.current.cacheConfig;

      act(() => {
        result.current.setCacheConfigState({
          ...originalConfig,
          enableCaching: false,
        });
      });

      expect(result.current.hasChanges()).toBe(true);

      act(() => {
        result.current.setCacheConfigState(originalConfig);
      });

      expect(result.current.hasChanges()).toBe(false);
    });
  });

  describe("handleSaveConfiguration", () => {
    it("should save configuration successfully", async () => {
      const { result } = renderHook(() => useCacheConfiguration());

      const saveResult = await act(async () => {
        return await result.current.handleSaveConfiguration();
      });

      expect(saveResult).toEqual({ success: true });
      expect(mockSetCacheConfig).toHaveBeenCalledWith({
        ttl: 86400000,
        scheduledRefresh: {
          enabled: true,
          time: "06:00",
          timezone: "America/Los_Angeles",
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: true,
        operationTTLs: {
          GetWidget: 0,
          GetWidgets: 0,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      });
      expect(mockReinitializeLambdaClient).toHaveBeenCalledTimes(1);
    });

    it("should reset original config after successful save", async () => {
      const { result } = renderHook(() => useCacheConfiguration());

      const modifiedConfig = {
        ...result.current.cacheConfig,
        enableCaching: false,
      };

      act(() => {
        result.current.setCacheConfigState(modifiedConfig);
      });

      expect(result.current.hasChanges()).toBe(true);

      await act(async () => {
        await result.current.handleSaveConfiguration();
      });

      expect(result.current.hasChanges()).toBe(false);
      expect(result.current.originalConfig).toEqual(modifiedConfig);
    });
  });
});
