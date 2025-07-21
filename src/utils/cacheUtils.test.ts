import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateScheduledRefreshInfo,
  clearAllCaches,
  refreshAllOperations,
  updateCacheStatus,
} from "./cacheUtils";

// Mock dependencies
vi.mock("../config/cache-config", () => ({
  getCacheConfig: vi.fn(() => ({
    scheduledRefresh: {
      enabled: true,
      time: "14:30",
      timezone: "America/New_York",
    },
  })),
}));

vi.mock("../services/base/lambdaService", () => ({
  lambdaService: {
    getAllOperationCacheStatus: vi.fn(),
    clearAllOperationCaches: vi.fn(),
    clearCache: vi.fn(),
  },
}));

// Import after mocks
import { getCacheConfig } from "../config/cache-config";
import { lambdaService } from "../services/base/lambdaService";

const mockGetCacheConfig = getCacheConfig as any;
const mockLambdaService = lambdaService as any;

describe("cacheUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateCacheStatus", () => {
    it("should return operation cache status from lambda service", () => {
      const mockStatus = [
        {
          operationName: "SmartMenuSettingsHybrid",
          exists: true,
          isExpired: false,
          age: 120000,
          ttl: 900000,
        },
      ];

      mockLambdaService.getAllOperationCacheStatus.mockReturnValue(mockStatus);

      const result = updateCacheStatus();

      expect(result).toEqual(mockStatus);
      expect(mockLambdaService.getAllOperationCacheStatus).toHaveBeenCalled();
    });
  });

  describe("calculateScheduledRefreshInfo", () => {
    it("should return disabled when scheduled refresh is disabled", () => {
      mockGetCacheConfig.mockReturnValue({
        scheduledRefresh: {
          enabled: false,
          time: "14:30",
          timezone: "America/New_York",
        },
      });

      const result = calculateScheduledRefreshInfo();

      expect(result).toEqual({ enabled: false });
    });

    it("should calculate next refresh time for today", () => {
      // Mock current time to be before scheduled time
      const mockDate = new Date("2024-01-15T10:00:00Z");
      vi.setSystemTime(mockDate);

      mockGetCacheConfig.mockReturnValue({
        scheduledRefresh: {
          enabled: true,
          time: "14:30",
          timezone: "America/New_York",
        },
      });

      const result = calculateScheduledRefreshInfo();

      expect(result.enabled).toBe(true);
      expect(result.scheduled).toBe(true);
      expect(result.scheduledTime).toBe("14:30");
      expect(result.timezone).toBe("America/New_York");
      expect(result.nextRefresh).toBeDefined();

      vi.useRealTimers();
    });

    it("should calculate next refresh time for tomorrow when today's time has passed", () => {
      // Mock current time to be after scheduled time
      const mockDate = new Date("2024-01-15T15:00:00Z");
      vi.setSystemTime(mockDate);

      mockGetCacheConfig.mockReturnValue({
        scheduledRefresh: {
          enabled: true,
          time: "14:30",
          timezone: "America/New_York",
        },
      });

      const result = calculateScheduledRefreshInfo();

      expect(result.enabled).toBe(true);
      expect(result.scheduled).toBe(true);
      expect(result.nextRefresh).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe("clearAllCaches", () => {
    it("should clear all operation caches and Apollo cache", async () => {
      mockLambdaService.clearCache.mockResolvedValue(undefined);

      await clearAllCaches();

      expect(mockLambdaService.clearAllOperationCaches).toHaveBeenCalled();
      expect(mockLambdaService.clearCache).toHaveBeenCalled();
    });
  });

  describe("refreshAllOperations", () => {
    it("should clear caches and wait before completing", async () => {
      mockLambdaService.clearCache.mockResolvedValue(undefined);

      const startTime = Date.now();
      await refreshAllOperations();
      const endTime = Date.now();

      expect(mockLambdaService.clearAllOperationCaches).toHaveBeenCalled();
      expect(mockLambdaService.clearCache).toHaveBeenCalled();

      // Should wait at least 2 seconds
      expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
    });
  });
});
