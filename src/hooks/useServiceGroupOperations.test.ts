import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
vi.mock("../components/cache/constants", () => ({
  SERVICE_GROUPS: [
    {
      name: "testGroup",
      displayName: "Test Group",
      operations: ["operation1", "operation2"],
    },
  ],
}));

vi.mock("../components/ui/ToastProvider", () => ({
  useToast: vi.fn(),
}));

vi.mock("../services/base/lambdaService", () => ({
  lambdaService: {
    clearOperationsCache: vi.fn(),
  },
}));

// Import after mocks
import { useToast } from "../components/ui/ToastProvider";
import { lambdaService } from "../services/base/lambdaService";
import { useServiceGroupOperations } from "./useServiceGroupOperations";

const mockUseToast = useToast as ReturnType<typeof vi.fn>;
const mockLambdaService = lambdaService as any;

describe("useServiceGroupOperations", () => {
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockHandleRefreshOperation: ReturnType<typeof vi.fn>;
  let mockHandleClearOperation: ReturnType<typeof vi.fn>;
  let mockUpdateStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockShowToast = vi.fn();
    mockHandleRefreshOperation = vi.fn();
    mockHandleClearOperation = vi.fn();
    mockUpdateStatus = vi.fn();

    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    });

    mockLambdaService.clearOperationsCache.mockResolvedValue(undefined);
    mockHandleRefreshOperation.mockResolvedValue({ success: true });
    mockHandleClearOperation.mockResolvedValue({ success: true });
  });

  describe("core operations", () => {
    it("should refresh service group successfully", async () => {
      const { result } = renderHook(() =>
        useServiceGroupOperations(
          mockHandleRefreshOperation,
          mockHandleClearOperation,
          mockUpdateStatus
        )
      );

      const refreshResult = await act(async () => {
        return await result.current.handleRefreshServiceGroup("testGroup");
      });

      expect(refreshResult).toEqual({ success: true });
      expect(mockLambdaService.clearOperationsCache).toHaveBeenCalledWith([
        "operation1",
        "operation2",
      ]);
      expect(mockHandleRefreshOperation).toHaveBeenCalledTimes(2);
      expect(mockUpdateStatus).toHaveBeenCalledTimes(1);
    });

    it("should clear service group successfully", async () => {
      const { result } = renderHook(() =>
        useServiceGroupOperations(
          mockHandleRefreshOperation,
          mockHandleClearOperation,
          mockUpdateStatus
        )
      );

      const clearResult = await act(async () => {
        return await result.current.handleClearServiceGroup("testGroup");
      });

      expect(clearResult).toEqual({ success: true });
      expect(mockLambdaService.clearOperationsCache).toHaveBeenCalledWith([
        "operation1",
        "operation2",
      ]);
      expect(mockUpdateStatus).toHaveBeenCalledTimes(1);
    });

    it("should throw error for unknown service group", async () => {
      const { result } = renderHook(() =>
        useServiceGroupOperations(
          mockHandleRefreshOperation,
          mockHandleClearOperation,
          mockUpdateStatus
        )
      );

      await expect(
        act(async () => {
          await result.current.handleRefreshServiceGroup("unknownGroup");
        })
      ).rejects.toThrow("Unknown service group: unknownGroup");
    });
  });

  describe("toast operations", () => {
    it("should show success toasts for refresh operation", async () => {
      const { result } = renderHook(() =>
        useServiceGroupOperations(
          mockHandleRefreshOperation,
          mockHandleClearOperation,
          mockUpdateStatus
        )
      );

      await act(async () => {
        await result.current.handleRefreshServiceGroupWithToast("testGroup");
      });

      expect(mockShowToast).toHaveBeenCalledTimes(2);
      expect(mockShowToast).toHaveBeenNthCalledWith(1, {
        title: "Starting Test Group refresh...",
        description: "Refreshing cache data. This may take a moment.",
        variant: "default",
      });
      expect(mockShowToast).toHaveBeenNthCalledWith(2, {
        title: "Test Group refreshed successfully!",
        description: "Cache data has been updated.",
        variant: "success",
      });
    });

    it("should show success toasts for clear operation", async () => {
      const { result } = renderHook(() =>
        useServiceGroupOperations(
          mockHandleRefreshOperation,
          mockHandleClearOperation,
          mockUpdateStatus
        )
      );

      await act(async () => {
        await result.current.handleClearServiceGroupWithToast("testGroup");
      });

      expect(mockShowToast).toHaveBeenCalledTimes(2);
      expect(mockShowToast).toHaveBeenNthCalledWith(1, {
        title: "Starting Test Group cache clear...",
        description: "Clearing cache data. This may take a moment.",
        variant: "default",
      });
      expect(mockShowToast).toHaveBeenNthCalledWith(2, {
        title: "Test Group cache cleared successfully!",
        description: "Cache data has been cleared.",
        variant: "success",
      });
    });
  });
});
