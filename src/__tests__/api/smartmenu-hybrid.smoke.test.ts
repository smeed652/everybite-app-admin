import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Mock the modules before importing the service
const mockApiClient = {
  query: vi.fn().mockResolvedValue({
    data: {
      widgets: [
        {
          id: "test-widget-1",
          name: "Test Widget 1",
          isActive: true,
          publishedAt: new Date().toISOString(),
          numberOfLocations: 5,
          displayImages: true,
          isOrderButtonEnabled: true,
          isByoEnabled: false,
          layout: "CARD",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  }),
};

const mockLambdaClient = {
  query: vi.fn().mockResolvedValue({
    data: {
      quarterlyMetrics: [
        {
          quarterLabel: "Q4 2024",
          activeSmartMenus: { count: 1, qoqGrowthPercent: 0 },
          locations: { count: 5, qoqGrowthPercent: 0 },
          orders: { count: 150, qoqGrowthPercent: 20 },
        },
      ],
    },
  }),
};

vi.mock("../../lib/api-graphql-apollo", () => ({
  apiGraphQLClient: mockApiClient,
}));

vi.mock("../../lib/datawarehouse-lambda-apollo", () => ({
  metabaseApolloClient: mockLambdaClient,
  lambdaClient: mockLambdaClient,
}));

describe("SmartMenu Settings Hybrid Service - Fast Local Test", () => {
  let service: any;

  beforeAll(async () => {
    // Import the service after mocking
    const { SmartMenuSettingsHybridService } = await import(
      "../../services/smartmenus/SmartMenuSettingsHybridService"
    );
    service = new SmartMenuSettingsHybridService();
  });

  afterAll(() => {
    // Clean up cache after tests
    service.clearCache();
  });

  it("should initialize service successfully", () => {
    expect(service).toBeDefined();
    expect(typeof service.getSmartMenuSettings).toBe("function");
    expect(typeof service.getCacheStats).toBe("function");
    expect(typeof service.clearCache).toBe("function");
  });

  it("should fetch SmartMenu settings using hybrid approach (mocked)", async () => {
    const result = await service.getSmartMenuSettings();

    // Basic structure validation
    expect(result).toBeDefined();
    expect(result.smartMenus).toBeDefined();
    expect(Array.isArray(result.smartMenus)).toBe(true);
    expect(result.quarterlyMetrics).toBeDefined();
    expect(Array.isArray(result.quarterlyMetrics)).toBe(true);

    // Basic performance metrics check
    expect(result.performanceMetrics).toBeDefined();
    expect(typeof result.performanceMetrics.totalTime).toBe("number");

    console.log("Hybrid service test completed:", {
      smartMenuCount: result.smartMenus.length,
      totalTime: result.performanceMetrics.totalTime,
    });
  }, 10000);

  it("should provide cache statistics", () => {
    const stats = service.getCacheStats();

    expect(stats).toBeDefined();
    expect(typeof stats.lastFetch).toBe("number");
    expect(typeof stats.cacheVersion).toBe("string");
    expect(typeof stats.cacheAge).toBe("number");

    console.log("Cache statistics:", stats);
  });

  it("should handle optimistic updates", async () => {
    const testWidgetId = "test-widget-123";
    const testChanges = {
      name: "Updated Test Widget",
      isActive: true,
    };

    // This should not throw an error
    await expect(
      service.updateSmartMenuOptimistically(testWidgetId, testChanges)
    ).resolves.not.toThrow();
  });

  it("should clear cache successfully", () => {
    // This should not throw an error
    expect(() => service.clearCache()).not.toThrow();

    // Verify cache is cleared
    const stats = service.getCacheStats();
    expect(stats.lastFetch).toBe(0);
    expect(stats.cacheVersion).toBe("1");
  });

  it("should have proper service interface", () => {
    // Test that service has all expected methods
    expect(typeof service.getSmartMenuSettings).toBe("function");
    expect(typeof service.getCacheStats).toBe("function");
    expect(typeof service.clearCache).toBe("function");
    expect(typeof service.updateSmartMenuOptimistically).toBe("function");
  });
});
