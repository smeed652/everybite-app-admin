import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service and logger
vi.mock("../services/smartmenus/SmartMenuSettingsHybridService", () => ({
  SmartMenuSettingsHybridService: vi.fn(),
}));

vi.mock("../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { logger } from "../lib/logger";
import { SmartMenuSettingsHybridService } from "../services/smartmenus/SmartMenuSettingsHybridService";
import { useSmartMenuSettingsHybrid } from "./useSmartMenuSettingsHybrid";

const mockSmartMenuSettingsHybridService =
  SmartMenuSettingsHybridService as ReturnType<typeof vi.fn>;
const mockLogger = logger as any;

describe("useSmartMenuSettingsHybrid", () => {
  let mockService: any;

  const mockData = {
    smartMenus: [
      { id: "1", name: "Menu 1", isActive: true },
      { id: "2", name: "Menu 2", isActive: false },
    ],
    performanceMetrics: {
      apiResponseTime: 150,
      lambdaResponseTime: 200,
      cacheHitRate: 0.85,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      getSmartMenuSettings: vi.fn(),
      updateSmartMenuOptimistically: vi.fn(),
      comparePerformance: vi.fn(),
      clearCache: vi.fn(),
      getCacheStats: vi.fn(),
    };

    mockSmartMenuSettingsHybridService.mockImplementation(() => mockService);
    mockService.getSmartMenuSettings.mockResolvedValue(mockData);
    mockService.updateSmartMenuOptimistically.mockResolvedValue(undefined);
    mockService.comparePerformance.mockResolvedValue({
      apiVsLambda: "api_faster",
      improvement: 0.25,
    });
    mockService.getCacheStats.mockReturnValue({
      hits: 10,
      misses: 2,
      hitRate: 0.83,
    });
  });

  describe("initial state", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("should create service instance", () => {
      renderHook(() => useSmartMenuSettingsHybrid());

      expect(mockSmartMenuSettingsHybridService).toHaveBeenCalledTimes(1);
    });
  });

  describe("data fetching", () => {
    it("should fetch data on mount", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        // Wait for the initial fetch to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockService.getSmartMenuSettings).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should log fetch operations", async () => {
      renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Fetching SmartMenu data"
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Data fetched successfully",
        {
          smartMenuCount: 2,
          performanceMetrics: mockData.performanceMetrics,
        }
      );
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Fetch failed");
      mockService.getSmartMenuSettings.mockRejectedValue(error);

      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Error fetching data",
        error
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockService.getSmartMenuSettings.mockRejectedValue("String error");

      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.error).toEqual(new Error("Unknown error"));
      expect(result.current.loading).toBe(false);
    });
  });

  describe("refetch", () => {
    it("should refetch data when called", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Clear the mock to verify it's called again
      mockService.getSmartMenuSettings.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockService.getSmartMenuSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateSmartMenuOptimistically", () => {
    it("should update SmartMenu optimistically", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const widgetId = "1";
      const changes = { name: "Updated Menu" };

      await act(async () => {
        await result.current.updateSmartMenuOptimistically(widgetId, changes);
      });

      expect(mockService.updateSmartMenuOptimistically).toHaveBeenCalledWith(
        widgetId,
        changes
      );
      expect(mockService.getSmartMenuSettings).toHaveBeenCalledTimes(2); // Initial + refetch
      expect(mockLogger.info).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] SmartMenu updated optimistically",
        {
          widgetId,
          changes: ["name"],
        }
      );
    });

    it("should handle update errors", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const error = new Error("Update failed");
      mockService.updateSmartMenuOptimistically.mockRejectedValue(error);

      await act(async () => {
        await result.current.updateSmartMenuOptimistically("1", {
          name: "Test",
        });
      });

      expect(result.current.error).toEqual(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Error updating SmartMenu",
        error
      );
    });
  });

  describe("comparePerformance", () => {
    it("should compare performance successfully", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      const performanceResult = await act(async () => {
        return await result.current.comparePerformance();
      });

      expect(mockService.comparePerformance).toHaveBeenCalledTimes(1);
      expect(performanceResult).toEqual({
        apiVsLambda: "api_faster",
        improvement: 0.25,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Performance comparison",
        performanceResult
      );
    });

    it("should handle performance comparison errors", async () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      const error = new Error("Comparison failed");
      mockService.comparePerformance.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.comparePerformance();
        })
      ).rejects.toThrow("Comparison failed");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Error comparing performance",
        error
      );
    });
  });

  describe("cache operations", () => {
    it("should clear cache", () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      act(() => {
        result.current.clearCache();
      });

      expect(mockService.clearCache).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "[useSmartMenuSettingsHybrid] Cache cleared"
      );
    });

    it("should get cache stats", () => {
      const { result } = renderHook(() => useSmartMenuSettingsHybrid());

      const stats = result.current.getCacheStats();

      expect(mockService.getCacheStats).toHaveBeenCalledTimes(1);
      expect(stats).toEqual({
        hits: 10,
        misses: 2,
        hitRate: 0.83,
      });
    });
  });

  describe("service instance management", () => {
    it("should create only one service instance", () => {
      const { rerender } = renderHook(() => useSmartMenuSettingsHybrid());

      rerender();

      expect(mockSmartMenuSettingsHybridService).toHaveBeenCalledTimes(1);
    });
  });
});
