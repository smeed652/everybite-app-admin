import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import {
  cacheUtils,
  getScheduledRefreshInfo,
} from "../../lib/datawarehouse-lambda-apollo";
import { CacheStatus } from "../CacheStatus";

// Mock the cacheUtils
vi.mock("../../lib/datawarehouse-lambda-apollo", () => ({
  cacheUtils: {
    getCacheStatus: vi.fn(),
    clearCache: vi.fn(),
    refreshOperation: vi.fn(),
  },
  getScheduledRefreshInfo: vi.fn(),
}));

const mockCacheUtils = cacheUtils as unknown as {
  getCacheStatus: ReturnType<typeof vi.fn>;
  clearCache: ReturnType<typeof vi.fn>;
  refreshOperation: ReturnType<typeof vi.fn>;
};

const mockGetScheduledRefreshInfo = getScheduledRefreshInfo as ReturnType<
  typeof vi.fn
>;

describe("CacheStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetScheduledRefreshInfo.mockReturnValue({
      enabled: false,
      scheduled: false,
    });
    // Mock cache as enabled by default
    mockCacheUtils.getCacheStatus.mockReturnValue({
      enabled: true,
      data: [
        {
          operation: "QuarterlyMetrics",
          age: 30,
          isStale: false,
        },
        {
          operation: "WidgetAnalytics",
          age: 45,
          isStale: true,
        },
      ],
    });
  });

  it("renders cache status information", () => {
    const mockStatus = {
      enabled: true,
      data: [
        {
          operation: "QuarterlyMetrics",
          age: 30,
          isStale: false,
        },
        {
          operation: "WidgetAnalytics",
          age: 120,
          isStale: false,
        },
      ],
    };

    mockCacheUtils.getCacheStatus.mockReturnValue(mockStatus);

    render(<CacheStatus />);

    expect(screen.getByText("Cache Status")).toBeInTheDocument();
    expect(screen.getByText("QuarterlyMetrics")).toBeInTheDocument();
    expect(screen.getByText("WidgetAnalytics")).toBeInTheDocument();
    expect(screen.getByText("30m ago")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("shows stale badge for expired cache", () => {
    const mockStatus = {
      enabled: true,
      data: [
        {
          operation: "QuarterlyMetrics",
          age: 1500, // 25 hours
          isStale: true,
        },
      ],
    };

    mockCacheUtils.getCacheStatus.mockReturnValue(mockStatus);

    render(<CacheStatus />);

    expect(screen.getByText("Stale")).toBeInTheDocument();
  });

  it("shows fresh badge for valid cache", () => {
    const mockStatus = {
      enabled: true,
      data: [
        {
          operation: "QuarterlyMetrics",
          age: 30,
          isStale: false,
        },
      ],
    };

    mockCacheUtils.getCacheStatus.mockReturnValue(mockStatus);

    render(<CacheStatus />);

    expect(screen.getByText("Fresh")).toBeInTheDocument();
  });

  it("shows no data message when no cache exists", () => {
    mockCacheUtils.getCacheStatus.mockReturnValue({
      enabled: true,
      data: [],
    });

    render(<CacheStatus />);

    expect(screen.getByText(/No cached data available/)).toBeInTheDocument();
  });

  it("calls clearCache when refresh all is clicked", async () => {
    mockCacheUtils.getCacheStatus.mockReturnValue({
      enabled: true,
      data: [],
    });

    render(<CacheStatus />);

    const refreshButton = screen.getByText("Refresh All");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockCacheUtils.clearCache).toHaveBeenCalled();
    });
  });

  it("calls refreshOperation when individual refresh is clicked", async () => {
    const mockStatus = {
      enabled: true,
      data: [
        {
          operation: "QuarterlyMetrics",
          age: 30,
          isStale: false,
        },
      ],
    };

    mockCacheUtils.getCacheStatus.mockReturnValue(mockStatus);

    render(<CacheStatus />);

    const refreshButtons = screen.getAllByText("Refresh");
    fireEvent.click(refreshButtons[0]); // Click the first refresh button

    await waitFor(() => {
      expect(mockCacheUtils.refreshOperation).toHaveBeenCalledWith(
        "QuarterlyMetrics"
      );
    });
  });

  it("disables buttons while refreshing", async () => {
    mockCacheUtils.getCacheStatus.mockReturnValue({
      enabled: true,
      data: [],
    });

    // Mock clearCache to be async and take some time
    let resolvePromise: () => void;
    const clearCachePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockCacheUtils.clearCache.mockImplementation(() => clearCachePromise);

    render(<CacheStatus />);

    const refreshButton = screen.getByText("Refresh All");
    fireEvent.click(refreshButton);

    // Wait for the async operation to start
    await waitFor(() => {
      expect(screen.getByText("Refreshing...")).toBeInTheDocument();
    });

    // Check that the button is disabled
    expect(refreshButton).toBeDisabled();

    // Resolve the promise to complete the test
    resolvePromise!();

    // Wait for the loading state to clear
    await waitFor(() => {
      expect(screen.getByText("Refresh All")).toBeInTheDocument();
    });
  });
});
