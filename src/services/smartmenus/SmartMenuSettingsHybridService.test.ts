import { beforeEach, describe, expect, it, vi } from "vitest";
import { SmartMenuSettingsHybridService } from "./SmartMenuSettingsHybridService";

// Mock dependencies
vi.mock("../../lib/api-graphql-apollo", () => ({
  apiGraphQLClient: {
    query: vi.fn(),
  },
}));

vi.mock("../../lib/datawarehouse-lambda-apollo", () => ({
  lambdaClient: {
    query: vi.fn(),
  },
}));

vi.mock("../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocks
import { apiGraphQLClient } from "../../lib/api-graphql-apollo";
import { lambdaClient } from "../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../lib/logger";

const mockApiGraphQLClient = apiGraphQLClient as any;
const mockLambdaClient = lambdaClient as any;
const mockLogger = logger as any;

describe("SmartMenuSettingsHybridService", () => {
  let service: SmartMenuSettingsHybridService;

  const mockSmartMenus = [
    {
      id: "1",
      name: "Test Menu 1",
      slug: "test-menu-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      publishedAt: "2024-01-01T00:00:00Z",
      numberOfLocations: 5,
      displayImages: true,
      layout: "card",
      isOrderButtonEnabled: true,
      isByoEnabled: false,
      primaryBrandColor: "#FF0000",
      supportedAllergens: ["nuts", "dairy"],
    },
  ];

  const mockQuarterlyMetrics = [
    {
      quarter: 1,
      year: 2024,
      quarterLabel: "Q1 2024",
      orders: {
        count: 1000,
        qoqGrowth: 100,
        qoqGrowthPercent: 10,
      },
      activeSmartMenus: {
        count: 50,
        qoqGrowth: 5,
        qoqGrowthPercent: 10,
      },
      locations: {
        count: 200,
        qoqGrowth: 20,
        qoqGrowthPercent: 10,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Clear localStorage before each test
    localStorage.clear();

    service = new SmartMenuSettingsHybridService();

    // Setup default mocks
    mockApiGraphQLClient.query.mockResolvedValue({
      data: { widgets: mockSmartMenus },
      errors: null,
    });

    mockLambdaClient.query.mockResolvedValue({
      data: { quarterlyMetrics: mockQuarterlyMetrics },
      errors: null,
    });
  });

  afterEach(() => {
    service.clearCache();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default cache version", () => {
      expect(service).toBeDefined();
      expect(service.getCacheStats().cacheVersion).toBe("1");
    });

    it("should load cache version from localStorage", () => {
      localStorage.setItem("smartmenu_hybrid_cache_v1", "2");

      const newService = new SmartMenuSettingsHybridService();

      expect(newService.getCacheStats().cacheVersion).toBe("2");
    });
  });

  describe("data operations", () => {
    it("should fetch data successfully from both sources", async () => {
      const result = await service.getSmartMenuSettings();

      expect(result.smartMenus).toEqual(mockSmartMenus);
      expect(result.quarterlyMetrics).toEqual(mockQuarterlyMetrics);
      expect(result.performanceMetrics.cacheHit).toBe(false);
      expect(result.cacheInfo.hasChanges).toBe(true);
    });

    it("should handle main API failure gracefully", async () => {
      mockApiGraphQLClient.query.mockRejectedValue(new Error("API Error"));

      const result = await service.getSmartMenuSettings();

      expect(result.smartMenus).toEqual([]);
      expect(result.quarterlyMetrics).toEqual(mockQuarterlyMetrics);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "[SmartMenuSettingsHybrid] Main API failed, returning empty array"
      );
    });

    it("should handle Lambda failure gracefully", async () => {
      mockLambdaClient.query.mockRejectedValue(new Error("Lambda Error"));

      const result = await service.getSmartMenuSettings();

      expect(result.smartMenus).toEqual(mockSmartMenus);
      expect(result.quarterlyMetrics).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "[SmartMenuSettingsHybrid] Lambda failed, returning empty quarterly metrics"
      );
    });

    it("should handle GraphQL errors", async () => {
      mockApiGraphQLClient.query.mockResolvedValue({
        data: null,
        errors: [{ message: "Field not found" }],
      });

      const result = await service.getSmartMenuSettings();

      expect(result.smartMenus).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "[SmartMenuSettingsHybrid] Main API GraphQL errors",
        [{ message: "Field not found" }]
      );
    });
  });

  describe("caching", () => {
    it("should serve cached data when available and valid", async () => {
      // First call to populate cache
      await service.getSmartMenuSettings();

      // Second call should use cache
      const result = await service.getSmartMenuSettings();

      expect(result.performanceMetrics.cacheHit).toBe(true);
      expect(result.cacheInfo.hasChanges).toBe(false);
      expect(mockApiGraphQLClient.query).toHaveBeenCalledTimes(1);
    });

    it("should invalidate cache when TTL expires", async () => {
      // Mock Date.now to control cache age
      const originalNow = Date.now;
      const mockNow = vi.fn();
      Date.now = mockNow;

      // First call
      mockNow.mockReturnValue(1000);
      await service.getSmartMenuSettings();

      // Second call after cache expires (5 minutes = 300000ms)
      mockNow.mockReturnValue(302000);
      await service.getSmartMenuSettings();

      expect(mockApiGraphQLClient.query).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should clear cache successfully", () => {
      service.clearCache();

      const stats = service.getCacheStats();
      expect(stats.lastFetch).toBe(0);
      expect(stats.cacheVersion).toBe("1");
    });
  });

  describe("optimistic updates", () => {
    it("should invalidate cache for widget updates", async () => {
      await service.updateSmartMenuOptimistically("widget-1", {
        name: "Updated Name",
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "[SmartMenuSettingsHybrid] Cache invalidated for widget update",
        expect.objectContaining({
          widgetId: "widget-1",
          changes: ["name"],
        })
      );
    });
  });

  describe("performance comparison", () => {
    it("should compare performance between APIs", async () => {
      const result = await service.comparePerformance();

      expect(result).toHaveProperty("mainApiTime");
      expect(result).toHaveProperty("lambdaTime");
      expect(result).toHaveProperty("recommendation");
      expect(typeof result.recommendation).toBe("string");
    });

    it("should return performance metrics and recommendation", async () => {
      const result = await service.comparePerformance();

      expect(result).toHaveProperty("mainApiTime");
      expect(result).toHaveProperty("lambdaTime");
      expect(result).toHaveProperty("recommendation");
      expect(typeof result.mainApiTime).toBe("number");
      expect(typeof result.lambdaTime).toBe("number");
      expect(typeof result.recommendation).toBe("string");
    });
  });

  describe("cache statistics", () => {
    it("should return accurate cache stats", () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty("lastFetch");
      expect(stats).toHaveProperty("cacheVersion");
      expect(stats).toHaveProperty("cacheAge");
      expect(typeof stats.lastFetch).toBe("number");
      expect(typeof stats.cacheVersion).toBe("string");
      expect(typeof stats.cacheAge).toBe("number");
    });
  });
});
