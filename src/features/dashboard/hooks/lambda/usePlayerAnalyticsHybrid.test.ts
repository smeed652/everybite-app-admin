import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the useSmartMenuSettings hook
vi.mock("../../../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

// Mock the logger
vi.mock("../../../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { useSmartMenuSettings } from "../../../../hooks/useSmartMenuSettings";
import { logger } from "../../../../lib/logger";
import { usePlayerAnalyticsHybrid } from "./usePlayerAnalyticsHybrid";

const mockUseSmartMenuSettings = useSmartMenuSettings as ReturnType<
  typeof vi.fn
>;
const mockLogger = logger as any;

describe("usePlayerAnalyticsHybrid", () => {
  const mockSmartMenus = [
    {
      id: "1",
      publishedAt: "2024-01-01T00:00:00Z",
      displayImages: true,
      layout: "CARD",
      isOrderButtonEnabled: true,
      isByoEnabled: false,
    },
    {
      id: "2",
      publishedAt: "2024-01-02T00:00:00Z",
      displayImages: false,
      layout: "TABLE",
      isOrderButtonEnabled: false,
      isByoEnabled: true,
    },
    {
      id: "3",
      publishedAt: null, // Not active
      displayImages: true,
      layout: "CARD",
      isOrderButtonEnabled: true,
      isByoEnabled: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mockSmartMenus,
      loading: false,
      error: null,
    });
  });

  it("should return analytics data from smart menu settings", () => {
    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.analytics).toEqual({
      totalActive: 2, // Only 2 have publishedAt
      withImages: 1, // Only 1 active has displayImages: true
      withCardLayout: 1, // Only 1 active has layout: "CARD"
      withOrdering: 1, // Only 1 active has isOrderButtonEnabled: true
      withByo: 1, // Only 1 active has isByoEnabled: true
    });
  });

  it("should return loading and error states", () => {
    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should handle loading state", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.loading).toBe(true);
  });

  it("should handle error state", () => {
    const errorMessage = "Failed to fetch data";
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      loading: false,
      error: errorMessage,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle empty smart menus", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.analytics).toEqual({
      totalActive: 1, // Default to 1 to avoid division by zero
      withImages: 0,
      withCardLayout: 0,
      withOrdering: 0,
      withByo: 0,
    });
  });

  it("should handle smart menus with no active items", () => {
    const inactiveSmartMenus = [
      {
        id: "1",
        publishedAt: null,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: true,
      },
      {
        id: "2",
        publishedAt: null,
        displayImages: false,
        layout: "TABLE",
        isOrderButtonEnabled: false,
        isByoEnabled: false,
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: inactiveSmartMenus,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.analytics).toEqual({
      totalActive: 1, // Default to 1 to avoid division by zero
      withImages: 0,
      withCardLayout: 0,
      withOrdering: 0,
      withByo: 0,
    });
  });

  it("should log analytics data for debugging", () => {
    renderHook(() => usePlayerAnalyticsHybrid());

    expect(mockLogger.info).toHaveBeenCalledWith(
      "[Analytics] Hybrid service data:",
      {
        smartMenuCount: 3,
        hasData: true,
      }
    );

    expect(mockLogger.info).toHaveBeenCalledWith(
      "[Analytics] Processed analytics from hybrid service:",
      {
        totalActive: 2,
        withImages: 1,
        withCardLayout: 1,
        withOrdering: 1,
        withByo: 1,
      }
    );
  });

  it("should handle case-insensitive layout comparison", () => {
    const mixedLayoutSmartMenus = [
      {
        id: "1",
        publishedAt: "2024-01-01T00:00:00Z",
        displayImages: true,
        layout: "card", // lowercase
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
      {
        id: "2",
        publishedAt: "2024-01-02T00:00:00Z",
        displayImages: true,
        layout: "CARD", // uppercase
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
      {
        id: "3",
        publishedAt: "2024-01-03T00:00:00Z",
        displayImages: true,
        layout: "Card", // mixed case
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mixedLayoutSmartMenus,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.analytics.withCardLayout).toBe(3); // All should match
  });

  it("should handle smart menus with undefined layout", () => {
    const undefinedLayoutSmartMenus = [
      {
        id: "1",
        publishedAt: "2024-01-01T00:00:00Z",
        displayImages: true,
        layout: undefined,
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: undefinedLayoutSmartMenus,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePlayerAnalyticsHybrid());

    expect(result.current.analytics.withCardLayout).toBe(0); // Should not match
  });
});
