import { beforeEach, describe, expect, it, vi } from "vitest";
import { SmartMenuSettingsService } from "./SmartMenuSettingsService";

// Mock dependencies
vi.mock(
  "../../features/dashboard/graphql/lambda/queries/smartmenu-settings",
  () => ({
    SMARTMENU_SETTINGS: "mock-smartmenu-settings-query",
  })
);

vi.mock("../base/DataService", () => ({
  DataService: vi.fn(),
}));

// Import after mocks
import { DataService } from "../base/DataService";

const mockDataService = DataService as any;

describe("SmartMenuSettingsService", () => {
  let service: SmartMenuSettingsService;

  const mockSmartMenus = [
    {
      id: "1",
      name: "Test Menu 1",
      slug: "test-menu-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      publishedAt: "2024-01-10T00:00:00Z",
      numberOfLocations: 5,
      displayImages: true,
      layout: "card",
      isOrderButtonEnabled: true,
      isByoEnabled: false,
      isActive: true,
      primaryBrandColor: "#FF0000",
      supportedAllergens: ["nuts", "dairy"],
      displaySoftSignUp: true,
      chain_nra_classifications: [{ nra_classification: "fast_casual" }],
      chain_menu_classifications: [{ menu_type: "lunch" }],
      chain_cuisine_classifications: [{ cuisine_type: "american" }],
      displayFooter: true,
      footerText: "Custom footer text",
    },
    {
      id: "2",
      name: "Test Menu 2",
      slug: "test-menu-2",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-16T00:00:00Z",
      publishedAt: null,
      numberOfLocations: 0,
      displayImages: false,
      layout: "table",
      isOrderButtonEnabled: false,
      isByoEnabled: true,
      isActive: false,
      primaryBrandColor: null,
      supportedAllergens: [],
      displaySoftSignUp: false,
      chain_nra_classifications: [{ nra_classification: "fine_dining" }],
      chain_menu_classifications: [{ menu_type: "dinner" }],
      chain_cuisine_classifications: [{ cuisine_type: "italian" }],
      displayFooter: false,
      footerText: null,
    },
  ];

  const mockQuarterlyMetrics = [
    {
      quarter: 1,
      year: 2024,
      quarterLabel: "Q1 2024",
      orders: { count: 100, qoqGrowth: 10, qoqGrowthPercent: 10 },
      activeSmartMenus: { count: 50, qoqGrowth: 5, qoqGrowthPercent: 10 },
      locations: { count: 200, qoqGrowth: 20, qoqGrowthPercent: 10 },
    },
    {
      quarter: 2,
      year: 2024,
      quarterLabel: "Q2 2024",
      orders: { count: 110, qoqGrowth: 10, qoqGrowthPercent: 10 },
      activeSmartMenus: { count: 55, qoqGrowth: 5, qoqGrowthPercent: 10 },
      locations: { count: 220, qoqGrowth: 20, qoqGrowthPercent: 10 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DataService constructor and methods
    mockDataService.mockImplementation(function (this: any, name: string) {
      this.name = name;
      this.executeQuery = vi.fn();
      this.getAll = vi.fn();
      this.getFiltered = vi.fn();
      this.handleError = vi.fn();
    });

    service = new SmartMenuSettingsService();
  });

  describe("initialization", () => {
    it("should initialize with correct name", () => {
      expect(service).toBeDefined();
      expect(mockDataService).toHaveBeenCalledWith(
        "SmartMenuSettingsService",
        undefined
      );
    });

    it("should initialize with custom config", () => {
      const config = { name: "CustomService" } as any;
      new SmartMenuSettingsService(config);
      expect(mockDataService).toHaveBeenCalledWith(
        "SmartMenuSettingsService",
        config
      );
    });
  });

  describe("core data operations", () => {
    it("should get SmartMenu settings successfully", async () => {
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        data: {
          db_widgetsList: {
            items: mockSmartMenus,
            pagination: { total: 2 },
          },
          quarterlyMetrics: mockQuarterlyMetrics,
        },
      });

      (service as any).executeQuery = mockExecuteQuery;

      const result = await service.getSmartMenuSettings();

      expect(result.data.smartMenus).toEqual(mockSmartMenus);
      expect(result.data.quarterlyMetrics).toEqual(mockQuarterlyMetrics);
      expect(result.metrics!.totalCount).toBe(2);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "mock-smartmenu-settings-query",
        undefined,
        expect.objectContaining({
          processResult: expect.any(Function),
          calculateMetrics: expect.any(Function),
        })
      );
    });

    it("should get SmartMenu metrics successfully", async () => {
      const mockGetSmartMenuSettings = vi.fn().mockResolvedValue({
        data: {
          smartMenus: mockSmartMenus,
          quarterlyMetrics: mockQuarterlyMetrics,
        },
        metrics: { totalCount: 2, processingTime: 100 },
      });

      (service as any).getSmartMenuSettings = mockGetSmartMenuSettings;

      const result = await service.getSmartMenuMetrics();

      expect(result.data.totalSmartMenus).toBe(2);
      expect(result.data.activeSmartMenus).toBe(1); // Only one has publishedAt
      expect(result.data.totalLocations).toBe(5); // Sum of numberOfLocations
      expect(result.data.featureAdoption.withImages).toBe(1);
      expect(result.data.featureAdoption.withOrderButton).toBe(1);
      expect(result.data.featureAdoption.withByo).toBe(1);
      expect(result.data.featureAdoption.byLayout).toEqual({
        card: 1,
        table: 1,
      });
    });
  });

  describe("filtering operations", () => {
    it("should get SmartMenus by layout", async () => {
      const mockGetFiltered = vi.fn().mockResolvedValue({
        data: [mockSmartMenus[0]],
        metrics: { totalCount: 1, processingTime: 50 },
      });

      (service as any).getFiltered = mockGetFiltered;

      const result = await service.getByLayout("card");

      expect(result.data).toEqual([mockSmartMenus[0]]);
      expect(mockGetFiltered).toHaveBeenCalledWith({ layout: "card" });
    });

    it("should get active SmartMenus", async () => {
      const mockGetFiltered = vi.fn().mockResolvedValue({
        data: [mockSmartMenus[0]],
        metrics: { totalCount: 1, processingTime: 50 },
      });

      (service as any).getFiltered = mockGetFiltered;

      const result = await service.getActiveSmartMenus();

      expect(result.data).toEqual([mockSmartMenus[0]]);
      expect(mockGetFiltered).toHaveBeenCalledWith({ isPublished: true });
    });

    it("should get SmartMenus with specific features", async () => {
      const mockGetFiltered = vi.fn().mockResolvedValue({
        data: [mockSmartMenus[0]],
        metrics: { totalCount: 1, processingTime: 50 },
      });

      (service as any).getFiltered = mockGetFiltered;

      const result = await service.getSmartMenusWithFeature("images");

      expect(result.data).toEqual([mockSmartMenus[0]]);
      expect(mockGetFiltered).toHaveBeenCalledWith({
        hasImages: true,
        hasOrderButton: false,
        hasByo: false,
        hasLocations: false,
      });
    });
  });

  describe("custom filtering operations", () => {
    it("should get SmartMenus with custom colors", async () => {
      const mockGetAll = vi.fn().mockResolvedValue({
        data: mockSmartMenus,
        metrics: { totalCount: 2, processingTime: 50 },
      });

      (service as any).getAll = mockGetAll;

      const result = await service.getSmartMenusWithCustomSettings("colors");

      expect(result.data).toEqual([mockSmartMenus[0]]); // Only first has primaryBrandColor
      expect(result.metrics!.filteredCount).toBe(1);
    });

    it("should get SmartMenus by NRA classification", async () => {
      const mockGetAll = vi.fn().mockResolvedValue({
        data: mockSmartMenus,
        metrics: { totalCount: 2, processingTime: 50 },
      });

      (service as any).getAll = mockGetAll;

      const result = await service.getByNRAClassification("fast_casual");

      expect(result.data).toEqual([mockSmartMenus[0]]);
      expect(result.metrics!.filteredCount).toBe(1);
    });

    it("should get SmartMenus with ordering enabled", async () => {
      const mockGetAll = vi.fn().mockResolvedValue({
        data: mockSmartMenus,
        metrics: { totalCount: 2, processingTime: 50 },
      });

      (service as any).getAll = mockGetAll;

      const result = await service.getSmartMenusWithOrdering();

      expect(result.data).toEqual([mockSmartMenus[0]]); // Only first has isOrderButtonEnabled: true
      expect(result.metrics!.filteredCount).toBe(1);
    });

    it("should get SmartMenus with footer enabled", async () => {
      const mockGetAll = vi.fn().mockResolvedValue({
        data: mockSmartMenus,
        metrics: { totalCount: 2, processingTime: 50 },
      });

      (service as any).getAll = mockGetAll;

      const result = await service.getSmartMenusWithFooter();

      expect(result.data).toEqual([mockSmartMenus[0]]); // Only first has displayFooter: true
      expect(result.metrics!.filteredCount).toBe(1);
    });
  });

  describe("statistics and metrics", () => {
    it("should get classification statistics", async () => {
      const mockGetAll = vi.fn().mockResolvedValue({
        data: mockSmartMenus,
        metrics: { totalCount: 2, processingTime: 50 },
      });

      (service as any).getAll = mockGetAll;

      const result = await service.getClassificationStats();

      expect(result.data.nraClassifications).toEqual({
        fast_casual: 1,
        fine_dining: 1,
      });
      expect(result.data.menuTypes).toEqual({
        lunch: 1,
        dinner: 1,
      });
      expect(result.data.cuisineTypes).toEqual({
        american: 1,
        italian: 1,
      });
      expect(result.data.orderingEnabled).toBe(1);
      expect(result.data.orderingDisabled).toBe(1);
    });
  });

  describe("error handling", () => {
    it("should handle errors in getSmartMenuSettings", async () => {
      const mockExecuteQuery = vi
        .fn()
        .mockRejectedValue(new Error("Query failed"));
      const mockHandleError = vi.fn();

      (service as any).executeQuery = mockExecuteQuery;
      (service as any).handleError = mockHandleError;

      await expect(service.getSmartMenuSettings()).rejects.toThrow(
        "Query failed"
      );
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle errors in getSmartMenuMetrics", async () => {
      const mockGetSmartMenuSettings = vi
        .fn()
        .mockRejectedValue(new Error("Metrics failed"));
      const mockHandleError = vi.fn();

      (service as any).getSmartMenuSettings = mockGetSmartMenuSettings;
      (service as any).handleError = mockHandleError;

      await expect(service.getSmartMenuMetrics()).rejects.toThrow(
        "Metrics failed"
      );
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
