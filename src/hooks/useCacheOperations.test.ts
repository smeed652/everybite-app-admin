import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the utility functions
vi.mock("../utils/cacheOperationStrategies", () => ({
  clearOperation: vi.fn(),
  refreshOperation: vi.fn(),
}));

vi.mock("../utils/cacheUtils", () => ({
  calculateScheduledRefreshInfo: vi.fn(),
  clearAllCaches: vi.fn(),
  refreshAllOperations: vi.fn(),
  updateCacheStatus: vi.fn(),
}));

// Import after mocks
import {
  clearOperation,
  refreshOperation,
} from "../utils/cacheOperationStrategies";
import {
  calculateScheduledRefreshInfo,
  clearAllCaches,
  refreshAllOperations,
  updateCacheStatus,
} from "../utils/cacheUtils";
import { useCacheOperations } from "./useCacheOperations";

const mockClearOperation = clearOperation as ReturnType<typeof vi.fn>;
const mockRefreshOperation = refreshOperation as ReturnType<typeof vi.fn>;
const mockCalculateScheduledRefreshInfo =
  calculateScheduledRefreshInfo as ReturnType<typeof vi.fn>;
const mockClearAllCaches = clearAllCaches as ReturnType<typeof vi.fn>;
const mockRefreshAllOperations = refreshAllOperations as ReturnType<
  typeof vi.fn
>;
const mockUpdateCacheStatus = updateCacheStatus as ReturnType<typeof vi.fn>;

describe("useCacheOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup default mock returns
    mockUpdateCacheStatus.mockReturnValue([
      {
        exists: true,
        operationName: "testOperation",
        age: 30,
        ttl: 60,
        isExpired: false,
        expiresIn: 30,
      },
    ]);

    mockCalculateScheduledRefreshInfo.mockReturnValue({
      enabled: true,
      scheduled: true,
      nextRefresh: "2024-01-01T01:00:00Z",
    });

    mockClearAllCaches.mockResolvedValue(undefined);
    mockRefreshAllOperations.mockResolvedValue(undefined);
    mockClearOperation.mockResolvedValue(undefined);
    mockRefreshOperation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with empty operation cache status", () => {
      // Mock empty initial state
      mockUpdateCacheStatus.mockReturnValue([]);
      mockCalculateScheduledRefreshInfo.mockReturnValue({ enabled: false });

      const { result } = renderHook(() => useCacheOperations());

      expect(result.current.operationCacheStatus).toEqual([]);
      expect(result.current.scheduledInfo).toEqual({ enabled: false });
    });

    it("should call updateStatus on mount", () => {
      renderHook(() => useCacheOperations());

      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(1);
      expect(mockCalculateScheduledRefreshInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateStatus", () => {
    it("should update operation cache status and scheduled info", () => {
      const mockStatuses = [
        {
          exists: true,
          operationName: "operation1",
          age: 10,
          ttl: 60,
          isExpired: false,
          expiresIn: 50,
        },
        {
          exists: false,
          operationName: "operation2",
          age: 0,
          ttl: 30,
          isExpired: true,
          expiresIn: -10,
        },
      ];

      const mockScheduledInfo = {
        enabled: true,
        scheduled: true,
        nextRefresh: "2024-01-01T02:00:00Z",
        timezone: "UTC",
      };

      mockUpdateCacheStatus.mockReturnValue(mockStatuses);
      mockCalculateScheduledRefreshInfo.mockReturnValue(mockScheduledInfo);

      const { result } = renderHook(() => useCacheOperations());

      // Trigger updateStatus
      result.current.updateStatus();

      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // Initial + manual call
      expect(mockCalculateScheduledRefreshInfo).toHaveBeenCalledTimes(2);

      expect(result.current.operationCacheStatus).toEqual(mockStatuses);
      expect(result.current.scheduledInfo).toEqual(mockScheduledInfo);
    });
  });

  describe("handleRefreshAll", () => {
    it("should refresh all caches successfully", async () => {
      const { result } = renderHook(() => useCacheOperations());

      const refreshResult = await result.current.handleRefreshAll();

      expect(mockClearAllCaches).toHaveBeenCalledTimes(1);
      expect(mockRefreshAllOperations).toHaveBeenCalledTimes(1);
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // Initial + after refresh
      expect(refreshResult).toEqual({ success: true });
    });

    it("should handle errors during refresh", async () => {
      const error = new Error("Refresh failed");
      mockClearAllCaches.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      const refreshResult = await result.current.handleRefreshAll();

      expect(mockClearAllCaches).toHaveBeenCalledTimes(1);
      expect(mockRefreshAllOperations).not.toHaveBeenCalled();
      expect(refreshResult).toEqual({ success: false, error });
    });

    it("should handle errors during refresh operations", async () => {
      const error = new Error("Refresh operations failed");
      mockRefreshAllOperations.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      const refreshResult = await result.current.handleRefreshAll();

      expect(mockClearAllCaches).toHaveBeenCalledTimes(1);
      expect(mockRefreshAllOperations).toHaveBeenCalledTimes(1);
      expect(refreshResult).toEqual({ success: false, error });
    });
  });

  describe("handleClearAllCache", () => {
    it("should clear all caches successfully", async () => {
      const { result } = renderHook(() => useCacheOperations());

      const clearResult = await result.current.handleClearAllCache();

      expect(mockClearAllCaches).toHaveBeenCalledTimes(1);
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // Initial + after clear
      expect(clearResult).toEqual({ success: true });
    });

    it("should handle errors during clear", async () => {
      const error = new Error("Clear failed");
      mockClearAllCaches.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      const clearResult = await result.current.handleClearAllCache();

      expect(mockClearAllCaches).toHaveBeenCalledTimes(1);
      expect(clearResult).toEqual({ success: false, error });
    });
  });

  describe("handleRefreshOperation", () => {
    it("should refresh specific operation successfully", async () => {
      const { result } = renderHook(() => useCacheOperations());

      const refreshResult =
        await result.current.handleRefreshOperation("testOperation");

      expect(mockRefreshOperation).toHaveBeenCalledWith("testOperation");
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // Initial + after refresh
      expect(refreshResult).toEqual({ success: true });
    });

    it("should handle errors during operation refresh", async () => {
      const error = new Error("Operation refresh failed");
      mockRefreshOperation.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      const refreshResult =
        await result.current.handleRefreshOperation("testOperation");

      expect(mockRefreshOperation).toHaveBeenCalledWith("testOperation");
      expect(refreshResult).toEqual({ success: false, error });
    });
  });

  describe("handleClearOperation", () => {
    it("should clear specific operation successfully", async () => {
      const { result } = renderHook(() => useCacheOperations());

      const clearResult =
        await result.current.handleClearOperation("testOperation");

      expect(mockClearOperation).toHaveBeenCalledWith("testOperation");
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // Initial + after clear
      expect(clearResult).toEqual({ success: true });
    });

    it("should handle errors during operation clear", async () => {
      const error = new Error("Operation clear failed");
      mockClearOperation.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      const clearResult =
        await result.current.handleClearOperation("testOperation");

      expect(mockClearOperation).toHaveBeenCalledWith("testOperation");
      expect(clearResult).toEqual({ success: false, error });
    });
  });

  describe("auto-update interval", () => {
    it("should set up interval to update status every minute", () => {
      const { result: _result } = renderHook(() => useCacheOperations());

      // Initial call
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(1);

      // Advance timer by 1 minute
      vi.advanceTimersByTime(60000);

      // Should have called updateStatus again
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2);
    });

    it("should clear interval on unmount", () => {
      const { unmount } = renderHook(() => useCacheOperations());

      // Advance timer to set up interval
      vi.advanceTimersByTime(60000);
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2);

      // Unmount should clear the interval
      unmount();

      // Advance timer again - should not call updateStatus
      vi.advanceTimersByTime(60000);
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2); // No additional calls
    });

    it("should handle multiple interval updates", () => {
      renderHook(() => useCacheOperations());

      // Initial call
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(1);

      // Advance by 2 minutes
      vi.advanceTimersByTime(120000);

      // Should have called updateStatus 3 times total (initial + 2 intervals)
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(3);
    });
  });

  describe("error handling", () => {
    it("should log errors to console", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation
      });
      const error = new Error("Test error");
      mockClearAllCaches.mockRejectedValue(error);

      const { result } = renderHook(() => useCacheOperations());

      await result.current.handleClearAllCache();

      expect(consoleSpy).toHaveBeenCalledWith("Error clearing cache:", error);
      consoleSpy.mockRestore();
    });

    it("should handle multiple consecutive errors", async () => {
      const error1 = new Error("First error");
      const error2 = new Error("Second error");

      mockClearAllCaches
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);

      const { result } = renderHook(() => useCacheOperations());

      const result1 = await result.current.handleClearAllCache();
      const result2 = await result.current.handleClearAllCache();

      expect(result1).toEqual({ success: false, error: error1 });
      expect(result2).toEqual({ success: false, error: error2 });
    });
  });

  describe("state updates", () => {
    it("should update state after successful operations", async () => {
      const { result } = renderHook(() => useCacheOperations());

      const _initialStatus = result.current.operationCacheStatus;

      // Perform an operation that triggers state update
      await result.current.handleRefreshAll();

      // State should be updated (updateStatus is called)
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(2);
    });

    it("should maintain state consistency across operations", async () => {
      const { result } = renderHook(() => useCacheOperations());

      // Perform multiple operations
      await result.current.handleRefreshAll();
      await result.current.handleClearAllCache();
      await result.current.handleRefreshOperation("test");

      // Each operation should call updateStatus
      expect(mockUpdateCacheStatus).toHaveBeenCalledTimes(4); // Initial + 3 operations
    });
  });
});
