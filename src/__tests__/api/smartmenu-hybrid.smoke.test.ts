import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SmartMenuSettingsHybridService } from "../../services/smartmenus/SmartMenuSettingsHybridService";

describe("SmartMenu Settings Hybrid Service - Smoke Test", () => {
  let service: SmartMenuSettingsHybridService;

  beforeAll(() => {
    service = new SmartMenuSettingsHybridService();
  });

  afterAll(() => {
    // Clean up cache after tests
    service.clearCache();
  });

  it("should fetch SmartMenu settings using hybrid approach", async () => {
    const result = await service.getSmartMenuSettings();

    // Verify the result structure
    expect(result).toBeDefined();
    expect(result.smartMenus).toBeDefined();
    expect(Array.isArray(result.smartMenus)).toBe(true);
    expect(result.quarterlyMetrics).toBeDefined();
    expect(Array.isArray(result.quarterlyMetrics)).toBe(true);

    // Verify performance metrics
    expect(result.performanceMetrics).toBeDefined();
    expect(typeof result.performanceMetrics.mainApiTime).toBe("number");
    expect(typeof result.performanceMetrics.lambdaTime).toBe("number");
    expect(typeof result.performanceMetrics.totalTime).toBe("number");
    expect(typeof result.performanceMetrics.cacheHit).toBe("boolean");

    // Verify cache info
    expect(result.cacheInfo).toBeDefined();
    expect(typeof result.cacheInfo.lastFetch).toBe("number");
    expect(typeof result.cacheInfo.cacheVersion).toBe("string");
    expect(typeof result.cacheInfo.hasChanges).toBe("boolean");

    console.log("Hybrid service performance metrics:", {
      mainApiTime: result.performanceMetrics.mainApiTime,
      lambdaTime: result.performanceMetrics.lambdaTime,
      totalTime: result.performanceMetrics.totalTime,
      smartMenuCount: result.smartMenus.length,
      quarterlyMetricsCount: result.quarterlyMetrics.length,
    });
  }, 30000); // 30 second timeout

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

  it("should compare performance between APIs", async () => {
    const comparison = await service.comparePerformance();

    expect(comparison).toBeDefined();
    expect(typeof comparison.mainApiTime).toBe("number");
    expect(typeof comparison.lambdaTime).toBe("number");
    expect(typeof comparison.recommendation).toBe("string");

    console.log("Performance comparison:", comparison);
  }, 30000); // 30 second timeout

  it("should clear cache successfully", () => {
    // This should not throw an error
    expect(() => service.clearCache()).not.toThrow();

    // Verify cache is cleared
    const stats = service.getCacheStats();
    expect(stats.lastFetch).toBe(0);
    expect(stats.cacheVersion).toBe("1");
  });
});
