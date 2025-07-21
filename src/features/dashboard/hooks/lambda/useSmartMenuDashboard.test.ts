import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the useSmartMenuSettings hook
vi.mock("../../../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

// Import after mocks
import { useSmartMenuSettings } from "../../../../hooks/useSmartMenuSettings";
import { useSmartMenuDashboard } from "./useSmartMenuDashboard";

const mockUseSmartMenuSettings = useSmartMenuSettings as ReturnType<
  typeof vi.fn
>;

describe("useSmartMenuDashboard", () => {
  const mockSmartMenus = [
    {
      id: "1",
      createdAt: "2024-01-01T00:00:00Z",
      publishedAt: "2024-01-15T00:00:00Z",
      numberOfLocations: 5,
    },
    {
      id: "2",
      createdAt: "2024-02-01T00:00:00Z",
      publishedAt: "2024-02-15T00:00:00Z",
      numberOfLocations: 10,
    },
    {
      id: "3",
      createdAt: "2024-03-01T00:00:00Z",
      publishedAt: null,
      numberOfLocations: 3,
    },
  ];

  const mockMetrics = {
    totalSmartMenus: 3,
    activeSmartMenus: 2,
    totalLocations: 18,
  };

  const mockQuarterlyMetrics = [
    {
      quarter: "Q1",
      year: 2024,
      quarterLabel: "Q1 2024",
      brands: { count: 10, qoqGrowth: 5, qoqGrowthPercent: 10 },
      locations: { count: 50, qoqGrowth: 10, qoqGrowthPercent: 20 },
      orders: { count: 1000, qoqGrowth: 100, qoqGrowthPercent: 15 },
      activeSmartMenus: { count: 8, qoqGrowth: 2, qoqGrowthPercent: 25 },
      totalRevenue: { amount: 50000, qoqGrowth: 5000, qoqGrowthPercent: 12 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mockSmartMenus,
      quarterlyMetrics: mockQuarterlyMetrics,
      loading: false,
      error: null,
      metrics: mockMetrics,
    });
  });

  it("should return dashboard metrics from smart menu settings", () => {
    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.metrics).toEqual({
      total: 3,
      active: 2,
      totalLocations: 18,
      totalDelta: expect.any(String),
      activeDelta: expect.any(String),
      locationsDelta: expect.any(String),
    });
  });

  it("should return widgets, quarterly metrics, loading, and error states", () => {
    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.widgets).toEqual(mockSmartMenus);
    expect(result.current.quarterlyMetrics).toEqual(mockQuarterlyMetrics);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should calculate trend deltas correctly", () => {
    // Mock smart menus with specific dates for trend calculation
    const trendSmartMenus = [
      {
        id: "1",
        createdAt: "2024-01-01T00:00:00Z", // 30+ days ago
        publishedAt: "2024-01-15T00:00:00Z", // 30+ days ago
        numberOfLocations: 5,
      },
      {
        id: "2",
        createdAt: "2024-02-01T00:00:00Z", // 30+ days ago
        publishedAt: "2024-02-15T00:00:00Z", // 30+ days ago
        numberOfLocations: 10,
      },
      {
        id: "3",
        createdAt: new Date().toISOString(), // Current period
        publishedAt: new Date().toISOString(), // Current period
        numberOfLocations: 3,
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: trendSmartMenus,
      quarterlyMetrics: mockQuarterlyMetrics,
      loading: false,
      error: null,
      metrics: {
        totalSmartMenus: 3,
        activeSmartMenus: 3,
        totalLocations: 18,
      },
    });

    const { result } = renderHook(() => useSmartMenuDashboard());

    // Should show growth since we have 1 new item in current period vs 2 in previous
    expect(result.current.metrics.totalDelta).toMatch(/^[+-]\d+(\.\d+)?%$/);
    expect(result.current.metrics.activeDelta).toMatch(/^[+-]\d+(\.\d+)?%$/);
    expect(result.current.metrics.locationsDelta).toMatch(/^[+-]\d+(\.\d+)?%$/);
  });

  it("should handle loading state", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: true,
      error: null,
      metrics: { totalSmartMenus: 0, activeSmartMenus: 0, totalLocations: 0 },
    });

    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.loading).toBe(true);
  });

  it("should handle error state", () => {
    const errorMessage = "Failed to fetch data";
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: false,
      error: errorMessage,
      metrics: { totalSmartMenus: 0, activeSmartMenus: 0, totalLocations: 0 },
    });

    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle empty smart menus", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: false,
      error: null,
      metrics: { totalSmartMenus: 0, activeSmartMenus: 0, totalLocations: 0 },
    });

    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.metrics).toEqual({
      total: 0,
      active: 0,
      totalLocations: 0,
      totalDelta: "0%",
      activeDelta: "0%",
      locationsDelta: "0%",
    });
  });

  it("should handle smart menus without publishedAt", () => {
    const unpublishedSmartMenus = [
      {
        id: "1",
        createdAt: "2024-01-01T00:00:00Z",
        publishedAt: null,
        numberOfLocations: 5,
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: unpublishedSmartMenus,
      quarterlyMetrics: [],
      loading: false,
      error: null,
      metrics: { totalSmartMenus: 1, activeSmartMenus: 0, totalLocations: 5 },
    });

    const { result } = renderHook(() => useSmartMenuDashboard());

    expect(result.current.metrics.active).toBe(0);
    expect(result.current.metrics.locationsDelta).toBe("0%");
  });
});
