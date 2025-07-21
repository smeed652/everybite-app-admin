import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service
vi.mock("../services/smartmenus/SmartMenuSettingsHybridService", () => ({
  SmartMenuSettingsHybridService: vi.fn(),
}));

// Import after mocks
import { SmartMenuSettingsHybridService } from "../services/smartmenus/SmartMenuSettingsHybridService";
import { useSmartMenuSettings } from "./useSmartMenuSettings";

const mockSmartMenuSettingsHybridService =
  SmartMenuSettingsHybridService as ReturnType<typeof vi.fn>;

describe("useSmartMenuSettings", () => {
  let mockService: any;

  const mockSmartMenus = [
    {
      id: "1",
      layout: "card",
      publishedAt: "2024-01-01",
      numberOfLocations: 5,
      displayImages: true,
      isOrderButtonEnabled: true,
      isByoEnabled: false,
      primaryBrandColor: "#FF0000",
      supportedAllergens: ["nuts", "dairy"],
      chain_nra_classifications: [{ nra_classification: "fast_casual" }],
      chain_menu_classifications: [{ menu_type: "lunch" }],
      chain_cuisine_classifications: [{ cuisine_type: "american" }],
      displaySoftSignUp: true,
    },
    {
      id: "2",
      layout: "table",
      publishedAt: null,
      numberOfLocations: 0,
      displayImages: false,
      isOrderButtonEnabled: false,
      isByoEnabled: true,
      primaryBrandColor: null,
      supportedAllergens: [],
      chain_nra_classifications: [{ nra_classification: "fine_dining" }],
      chain_menu_classifications: [{ menu_type: "dinner" }],
      chain_cuisine_classifications: [{ cuisine_type: "italian" }],
      displaySoftSignUp: false,
    },
  ];

  const mockQuarterlyMetrics = [
    { quarter: "Q1 2024", revenue: 100000 },
    { quarter: "Q2 2024", revenue: 150000 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      getSmartMenuSettings: vi.fn(),
    };

    mockSmartMenuSettingsHybridService.mockImplementation(() => mockService);
    mockService.getSmartMenuSettings.mockResolvedValue({
      smartMenus: mockSmartMenus,
      quarterlyMetrics: mockQuarterlyMetrics,
    });
  });

  describe("initial state", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.smartMenus).toEqual([]);
      expect(result.current.quarterlyMetrics).toEqual([]);
    });

    it("should create service instance", () => {
      renderHook(() => useSmartMenuSettings());

      expect(mockSmartMenuSettingsHybridService).toHaveBeenCalledTimes(1);
    });
  });

  describe("data loading", () => {
    it("should load data successfully", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.smartMenus).toEqual(mockSmartMenus);
      expect(result.current.quarterlyMetrics).toEqual(mockQuarterlyMetrics);
      expect(mockService.getSmartMenuSettings).toHaveBeenCalledTimes(1);
    });

    it("should handle loading errors", async () => {
      const error = new Error("Failed to load");
      mockService.getSmartMenuSettings.mockRejectedValue(error);

      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Failed to load");
      expect(result.current.smartMenus).toEqual([]);
    });
  });

  describe("metrics calculation", () => {
    it("should calculate metrics correctly", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.metrics.totalSmartMenus).toBe(2);
      expect(result.current.metrics.activeSmartMenus).toBe(1);
      expect(result.current.metrics.totalLocations).toBe(5);
      expect(result.current.metrics.featureAdoption.withImages).toBe(1);
      expect(result.current.metrics.featureAdoption.withOrderButton).toBe(1);
      expect(result.current.metrics.featureAdoption.withByo).toBe(1);
      expect(result.current.metrics.featureAdoption.byLayout).toEqual({
        card: 1,
        table: 1,
      });
      expect(result.current.metrics.settings.withCustomColors).toBe(1);
      expect(result.current.metrics.settings.withAllergens).toBe(1);
      expect(result.current.metrics.classifications.orderingEnabled).toBe(1);
      expect(result.current.metrics.classifications.orderingDisabled).toBe(1);
    });
  });

  describe("service methods", () => {
    it("should filter by layout", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const cardMenus = await result.current.getByLayout("card");
      expect(cardMenus).toHaveLength(1);
      expect(cardMenus[0].id).toBe("1");

      const tableMenus = await result.current.getByLayout("table");
      expect(tableMenus).toHaveLength(1);
      expect(tableMenus[0].id).toBe("2");
    });

    it("should get active smart menus", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const activeMenus = await result.current.getActiveSmartMenus();
      expect(activeMenus).toHaveLength(1);
      expect(activeMenus[0].id).toBe("1");
    });

    it("should filter by features", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const menusWithImages =
        await result.current.getSmartMenusWithFeature("images");
      expect(menusWithImages).toHaveLength(1);
      expect(menusWithImages[0].id).toBe("1");

      const menusWithOrderButton =
        await result.current.getSmartMenusWithFeature("orderButton");
      expect(menusWithOrderButton).toHaveLength(1);
      expect(menusWithOrderButton[0].id).toBe("1");
    });

    it("should filter by classifications", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const fastCasualMenus =
        await result.current.getByNRAClassification("fast_casual");
      expect(fastCasualMenus).toHaveLength(1);
      expect(fastCasualMenus[0].id).toBe("1");

      const lunchMenus = await result.current.getByMenuType("lunch");
      expect(lunchMenus).toHaveLength(1);
      expect(lunchMenus[0].id).toBe("1");
    });

    it("should get menus with footer features", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const menusWithFooter = await result.current.getSmartMenusWithFooter();
      expect(menusWithFooter).toHaveLength(1);
      expect(menusWithFooter[0].id).toBe("1");
    });
  });

  describe("refresh functionality", () => {
    it("should refresh data", async () => {
      const { result } = renderHook(() => useSmartMenuSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Clear the mock to verify it's called again
      mockService.getSmartMenuSettings.mockClear();

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockService.getSmartMenuSettings).toHaveBeenCalledTimes(1);
    });
  });
});
