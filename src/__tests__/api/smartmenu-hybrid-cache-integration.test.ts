import { describe, expect, it } from "vitest";
import { SERVICE_GROUPS } from "../../components/cache/constants";
import { getCacheConfig } from "../../config/cache-config";
import { getOperationStrategy } from "../../utils/cacheOperationStrategies";

describe("SmartMenuSettingsHybrid Cache Integration", () => {
  it("should be included in service groups", () => {
    const dashboardGroup = SERVICE_GROUPS.find(
      (group) => group.name === "dashboard"
    );
    expect(dashboardGroup).toBeDefined();
    expect(dashboardGroup?.operations).toContain("SmartMenuSettingsHybrid");
  });

  it("should have cache configuration", () => {
    const config = getCacheConfig();
    expect(config.operationTTLs.SmartMenuSettingsHybrid).toBeDefined();
    expect(config.operationTTLs.SmartMenuSettingsHybrid).toBe(
      12 * 60 * 60 * 1000
    ); // 12 hours
  });

  it("should have operation strategy", () => {
    const strategy = getOperationStrategy("SmartMenuSettingsHybrid");
    expect(strategy).toBeDefined();
    expect(typeof strategy.refresh).toBe("function");
    expect(typeof strategy.clear).toBe("function");
  });

  it("should be different from regular SmartMenuSettings strategy", () => {
    const hybridStrategy = getOperationStrategy("SmartMenuSettingsHybrid");
    const regularStrategy = getOperationStrategy("SmartMenuSettings");

    // They should be different objects (different strategies)
    expect(hybridStrategy).not.toBe(regularStrategy);
  });
});
