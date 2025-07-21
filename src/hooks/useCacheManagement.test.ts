import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the underlying hooks
vi.mock("./useCacheConfiguration", () => ({
  useCacheConfiguration: vi.fn(),
}));

vi.mock("./useCacheOperations", () => ({
  useCacheOperations: vi.fn(),
}));

vi.mock("./useCacheUIState", () => ({
  useCacheUIState: vi.fn(),
}));

// Import after mocks
import { useCacheConfiguration } from "./useCacheConfiguration";
import { useCacheManagement } from "./useCacheManagement";
import { useCacheOperations } from "./useCacheOperations";
import { useCacheUIState } from "./useCacheUIState";

const mockUseCacheConfiguration = useCacheConfiguration as ReturnType<
  typeof vi.fn
>;
const mockUseCacheOperations = useCacheOperations as ReturnType<typeof vi.fn>;
const mockUseCacheUIState = useCacheUIState as ReturnType<typeof vi.fn>;

describe("useCacheManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks to return simple test data
    mockUseCacheConfiguration.mockReturnValue({
      cacheConfig: { enableCaching: true },
      originalConfig: { enableCaching: false },
      isSaving: false,
      setCacheConfigState: vi.fn(),
      hasChanges: () => true,
      handleSaveConfiguration: vi.fn(),
    });

    mockUseCacheOperations.mockReturnValue({
      operationCacheStatus: [],
      scheduledInfo: { enabled: false },
      updateStatus: vi.fn(),
      handleRefreshAll: vi.fn(),
      handleClearAllCache: vi.fn(),
      handleRefreshOperation: vi.fn(),
      handleClearOperation: vi.fn(),
    });

    mockUseCacheUIState.mockReturnValue({
      selectedOperation: null,
      isViewerOpen: false,
      setSelectedOperation: vi.fn(),
      setIsViewerOpen: vi.fn(),
      handleViewContents: vi.fn(),
      handleCloseViewer: vi.fn(),
    });
  });

  describe("initial state", () => {
    it("should return all expected state properties", () => {
      const { result } = renderHook(() => useCacheManagement());

      // State from useCacheConfiguration
      expect(result.current.cacheConfig).toBeDefined();
      expect(result.current.originalConfig).toBeDefined();
      expect(result.current.isSaving).toBe(false);
      expect(typeof result.current.hasChanges).toBe("function");

      // State from useCacheOperations
      expect(result.current.operationCacheStatus).toBeDefined();
      expect(result.current.scheduledInfo).toBeDefined();

      // State from useCacheUIState
      expect(result.current.selectedOperation).toBeNull();
      expect(result.current.isViewerOpen).toBe(false);
    });

    it("should return all expected action functions", () => {
      const { result } = renderHook(() => useCacheManagement());

      // Actions from useCacheConfiguration
      expect(typeof result.current.setCacheConfigState).toBe("function");
      expect(typeof result.current.handleSaveConfiguration).toBe("function");

      // Actions from useCacheOperations
      expect(typeof result.current.updateStatus).toBe("function");
      expect(typeof result.current.handleRefreshAll).toBe("function");
      expect(typeof result.current.handleClearAllCache).toBe("function");
      expect(typeof result.current.handleRefreshOperation).toBe("function");
      expect(typeof result.current.handleClearOperation).toBe("function");

      // Actions from useCacheUIState
      expect(typeof result.current.setSelectedOperation).toBe("function");
      expect(typeof result.current.setIsViewerOpen).toBe("function");
      expect(typeof result.current.handleViewContents).toBe("function");
      expect(typeof result.current.handleCloseViewer).toBe("function");
    });
  });

  describe("hook composition", () => {
    it("should call all three underlying hooks", () => {
      renderHook(() => useCacheManagement());

      expect(mockUseCacheConfiguration).toHaveBeenCalledTimes(1);
      expect(mockUseCacheOperations).toHaveBeenCalledTimes(1);
      expect(mockUseCacheUIState).toHaveBeenCalledTimes(1);
    });

    it("should return functions that call the underlying hook functions", () => {
      const mockSetCacheConfigState = vi.fn();
      const mockHandleRefreshAll = vi.fn();
      const mockSetSelectedOperation = vi.fn();

      mockUseCacheConfiguration.mockReturnValue({
        cacheConfig: { enableCaching: true },
        originalConfig: { enableCaching: false },
        isSaving: false,
        setCacheConfigState: mockSetCacheConfigState,
        hasChanges: () => true,
        handleSaveConfiguration: vi.fn(),
      });

      mockUseCacheOperations.mockReturnValue({
        operationCacheStatus: [],
        scheduledInfo: { enabled: false },
        updateStatus: vi.fn(),
        handleRefreshAll: mockHandleRefreshAll,
        handleClearAllCache: vi.fn(),
        handleRefreshOperation: vi.fn(),
        handleClearOperation: vi.fn(),
      });

      mockUseCacheUIState.mockReturnValue({
        selectedOperation: null,
        isViewerOpen: false,
        setSelectedOperation: mockSetSelectedOperation,
        setIsViewerOpen: vi.fn(),
        handleViewContents: vi.fn(),
        handleCloseViewer: vi.fn(),
      });

      const { result } = renderHook(() => useCacheManagement());

      // Test that calling the returned functions calls the underlying functions
      const testConfig = {
        enableCaching: false,
        scheduledRefreshEnabled: false,
        scheduledRefreshTime: "00:00",
        scheduledRefreshTimezone: "UTC",
        cacheTTLHours: 24,
        operationTTLs: {},
      };
      result.current.setCacheConfigState(testConfig);
      expect(mockSetCacheConfigState).toHaveBeenCalledWith(testConfig);

      result.current.handleRefreshAll();
      expect(mockHandleRefreshAll).toHaveBeenCalled();

      const testOperation = { operation: "test", isCached: false };
      result.current.setSelectedOperation(testOperation);
      expect(mockSetSelectedOperation).toHaveBeenCalledWith(testOperation);
    });
  });

  describe("interface consistency", () => {
    it("should maintain consistent interface across renders", () => {
      const { result, rerender } = renderHook(() => useCacheManagement());

      const firstRender = { ...result.current };
      rerender();
      const secondRender = { ...result.current };

      // Check that all expected properties exist in both renders
      const expectedProperties = [
        "operationCacheStatus",
        "scheduledInfo",
        "isSaving",
        "selectedOperation",
        "isViewerOpen",
        "cacheConfig",
        "originalConfig",
        "setCacheConfigState",
        "setSelectedOperation",
        "setIsViewerOpen",
        "hasChanges",
        "updateStatus",
        "handleRefreshAll",
        "handleClearAllCache",
        "handleRefreshOperation",
        "handleClearOperation",
        "handleSaveConfiguration",
        "handleViewContents",
        "handleCloseViewer",
      ];

      expectedProperties.forEach((prop) => {
        expect(prop in firstRender).toBe(true);
        expect(prop in secondRender).toBe(true);
      });
    });
  });
});
