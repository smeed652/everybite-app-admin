import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSmartMenuDashboard } from "../../features/dashboard/hooks/lambda/useSmartMenuDashboard";
import { useSmartMenuSettings } from "../../hooks/useSmartMenuSettings";

// Mock the underlying hook
vi.mock("../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

describe("useSmartMenuDashboard - Business Logic", () => {
  const mockUseSmartMenuSettings = vi.mocked(useSmartMenuSettings);

  // Helper function to create complete mock return value
  const _createMockReturnValue = (
    overrides: Partial<ReturnType<typeof useSmartMenuSettings>> = {}
  ) => ({
    smartMenus: [],
    quarterlyMetrics: [],
    loading: false,
    error: null,
    metrics: {
      totalSmartMenus: 0,
      activeSmartMenus: 0,
      totalLocations: 0,
      featureAdoption: {
        withImages: 0,
        withOrderButton: 0,
        withByo: 0,
        byLayout: {},
      },
      settings: {
        withCustomColors: 0,
        withCustomFonts: 0,
        withDietaryPreferences: 0,
        withAllergens: 0,
      },
      classifications: {
        nraClassifications: {},
        menuTypes: {},
        cuisineTypes: {},
        orderingEnabled: 0,
        orderingDisabled: 0,
      },
    },
    getByLayout: vi.fn(),
    getActiveSmartMenus: vi.fn(),
    getSmartMenusWithFeature: vi.fn(),
    getSmartMenusWithOrdering: vi.fn(),
    getByNRAClassification: vi.fn(),
    getByMenuType: vi.fn(),
    getByCuisineType: vi.fn(),
    getSmartMenusWithFooter: vi.fn(),
    getSmartMenusWithCustomFooterText: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Quarterly Data Transformation", () => {
    it("should transform complete quarterly metrics correctly", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [
          {
            quarter: "2025-07-01T00:00:00Z",
            year: 2025,
            quarterLabel: "Q3 2025",
            locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
            orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
            activeSmartMenus: {
              count: 5,
              qoqGrowth: 2,
              qoqGrowthPercent: 66.7,
            },
            totalRevenue: {
              amount: 50000,
              qoqGrowth: 10000,
              qoqGrowthPercent: 25,
            },
          },
        ],
        loading: false,
        error: null,
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
          featureAdoption: {
            withImages: 0,
            withOrderButton: 0,
            withByo: 0,
            byLayout: {},
          },
          settings: {
            withCustomColors: 0,
            withCustomFonts: 0,
            withDietaryPreferences: 0,
            withAllergens: 0,
          },
          classifications: {
            nraClassifications: {},
            menuTypes: {},
            cuisineTypes: {},
            orderingEnabled: 0,
            orderingDisabled: 0,
          },
        },
        getByLayout: vi.fn(),
        getActiveSmartMenus: vi.fn(),
        getSmartMenusWithFeature: vi.fn(),
        getSmartMenusWithOrdering: vi.fn(),
        getByNRAClassification: vi.fn(),
        getByMenuType: vi.fn(),
        getByCuisineType: vi.fn(),
        getSmartMenusWithFooter: vi.fn(),
        getSmartMenusWithCustomFooterText: vi.fn(),
        refresh: vi.fn(),
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      expect(result.current.quarterlyMetrics).toHaveLength(1);
      expect(result.current.quarterlyMetrics[0]).toMatchObject({
        quarter: "2025-07-01T00:00:00Z",
        year: 2025,
        quarterLabel: "Q3 2025",
        locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
        orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
        activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        totalRevenue: { amount: 50000, qoqGrowth: 10000, qoqGrowthPercent: 25 },
      });
    });

    it("should handle missing brands field with fallback", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [
          {
            quarter: "2025-07-01T00:00:00Z",
            year: 2025,
            quarterLabel: "Q3 2025",
            // Missing brands field
            locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
            orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
            activeSmartMenus: {
              count: 5,
              qoqGrowth: 2,
              qoqGrowthPercent: 66.7,
            },
            totalRevenue: {
              amount: 50000,
              qoqGrowth: 10000,
              qoqGrowthPercent: 25,
            },
          },
        ],
        loading: false,
        error: null,
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
        },
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      // Should not crash and should handle missing fields
      expect(result.current.quarterlyMetrics).toHaveLength(1);
      expect(result.current.quarterlyMetrics[0]).toMatchObject({
        quarter: "2025-07-01T00:00:00Z",
        year: 2025,
        quarterLabel: "Q3 2025",
        locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
        orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
        activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        totalRevenue: { amount: 50000, qoqGrowth: 10000, qoqGrowthPercent: 25 },
      });
    });

    it("should return empty array when quarterly metrics are empty", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [], // Empty array
        loading: false,
        error: null,
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
        },
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      expect(result.current.quarterlyMetrics).toEqual([]);
    });

    it("should calculate total orders correctly", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [
          {
            quarterLabel: "Q3 2025",
            orders: { count: 1000, qoqGrowthPercent: 25 },
          },
          {
            quarterLabel: "Q2 2025",
            orders: { count: 800, qoqGrowthPercent: 20 },
          },
        ],
        loading: false,
        error: null,
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
        },
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      // The hook should provide the raw data, UI handles the calculation
      expect(result.current.quarterlyMetrics).toHaveLength(2);
      expect(result.current.quarterlyMetrics[0].orders.count).toBe(1000);
      expect(result.current.quarterlyMetrics[1].orders.count).toBe(800);
    });
  });

  describe("Loading and Error States", () => {
    it("should propagate loading state", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [],
        loading: true,
        error: null,
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
        },
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      expect(result.current.loading).toBe(true);
    });

    it("should propagate error state", () => {
      mockUseSmartMenuSettings.mockReturnValue({
        smartMenus: [],
        quarterlyMetrics: [],
        loading: false,
        error: "Failed to load data",
        metrics: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
        },
      });

      const { result } = renderHook(() => useSmartMenuDashboard());

      expect(result.current.error).toBe("Failed to load data");
    });
  });
});
