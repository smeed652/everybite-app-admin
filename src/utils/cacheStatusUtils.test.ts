import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCacheStatusResponse } from "./cacheStatusUtils";

// Mock dependencies
vi.mock("../components/cache/constants", () => ({
  SERVICE_GROUPS: [
    {
      name: "SmartMenu",
      operations: ["SmartMenuSettingsHybrid", "SmartMenuSettings"],
    },
    {
      name: "Users",
      operations: ["MetabaseUsers"],
    },
  ],
}));

vi.mock("../config/cache-config", () => ({
  getCacheConfig: vi.fn(() => ({
    ttl: 1000 * 60 * 5, // 5 minutes
    operationTTLs: {
      MetabaseUsers: 1000 * 60 * 10, // 10 minutes
      SmartMenuSettingsHybrid: 1000 * 60 * 15, // 15 minutes
    },
  })),
}));

// Import after mocks

describe("cacheStatusUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log during tests
    vi.spyOn(console, "log").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCacheStatusResponse", () => {
    it("should return cache status for all expected operations", () => {
      const operationCacheStatus = [
        {
          operationName: "SmartMenuSettingsHybrid",
          exists: true,
          isExpired: false,
          age: 120000, // 2 minutes
          ttl: 900000, // 15 minutes
        },
        {
          operationName: "MetabaseUsers",
          exists: true,
          isExpired: true,
          age: 720000, // 12 minutes
          ttl: 600000, // 10 minutes
        },
      ];

      const result = getCacheStatusResponse(operationCacheStatus, true);

      expect(result.enabled).toBe(true);
      expect(result.data).toHaveLength(3); // 3 operations total
      expect(result.data).toEqual(
        expect.arrayContaining([
          {
            operation: "SmartMenuSettingsHybrid",
            isCached: true,
            isStale: false,
            age: 120000,
            ttl: 900000,
          },
          {
            operation: "MetabaseUsers",
            isCached: false, // exists but expired
            isStale: true,
            age: 720000,
            ttl: 600000,
          },
          {
            operation: "SmartMenuSettings",
            isCached: false,
            isStale: false,
            age: 0,
            ttl: 300000, // default TTL (5 minutes)
          },
        ])
      );
    });

    it("should handle operations with no cache status", () => {
      const operationCacheStatus: any[] = [];

      const result = getCacheStatusResponse(operationCacheStatus, true);

      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual(
        expect.arrayContaining([
          {
            operation: "SmartMenuSettingsHybrid",
            isCached: false,
            isStale: false,
            age: 0,
            ttl: 900000, // operation-specific TTL
          },
          {
            operation: "MetabaseUsers",
            isCached: false,
            isStale: false,
            age: 0,
            ttl: 600000, // operation-specific TTL
          },
          {
            operation: "SmartMenuSettings",
            isCached: false,
            isStale: false,
            age: 0,
            ttl: 300000, // default TTL
          },
        ])
      );
    });

    it("should respect caching enabled flag", () => {
      const operationCacheStatus = [
        {
          operationName: "SmartMenuSettingsHybrid",
          exists: true,
          isExpired: false,
          age: 120000,
          ttl: 900000,
        },
      ];

      const result = getCacheStatusResponse(operationCacheStatus, false);

      expect(result.enabled).toBe(false);
      expect(result.data).toHaveLength(3);
    });

    it("should use operation-specific TTL when available", () => {
      const operationCacheStatus: any[] = [];

      const result = getCacheStatusResponse(operationCacheStatus, true);

      const metabaseUsers = result.data.find(
        (item) => item.operation === "MetabaseUsers"
      );
      const smartMenuHybrid = result.data.find(
        (item) => item.operation === "SmartMenuSettingsHybrid"
      );
      const smartMenuSettings = result.data.find(
        (item) => item.operation === "SmartMenuSettings"
      );

      expect(metabaseUsers?.ttl).toBe(600000); // 10 minutes (operation-specific)
      expect(smartMenuHybrid?.ttl).toBe(900000); // 15 minutes (operation-specific)
      expect(smartMenuSettings?.ttl).toBe(300000); // 5 minutes (default)
    });

    it("should handle expired cache correctly", () => {
      const operationCacheStatus = [
        {
          operationName: "SmartMenuSettingsHybrid",
          exists: true,
          isExpired: true,
          age: 1000000, // 16+ minutes
          ttl: 900000, // 15 minutes
        },
      ];

      const result = getCacheStatusResponse(operationCacheStatus, true);

      const smartMenuHybrid = result.data.find(
        (item) => item.operation === "SmartMenuSettingsHybrid"
      );

      expect(smartMenuHybrid?.isCached).toBe(false);
      expect(smartMenuHybrid?.isStale).toBe(true);
    });

    it("should handle non-existent cache correctly", () => {
      const operationCacheStatus = [
        {
          operationName: "SmartMenuSettingsHybrid",
          exists: false,
          isExpired: false,
          age: 0,
          ttl: 900000,
        },
      ];

      const result = getCacheStatusResponse(operationCacheStatus, true);

      const smartMenuHybrid = result.data.find(
        (item) => item.operation === "SmartMenuSettingsHybrid"
      );

      expect(smartMenuHybrid?.isCached).toBe(false);
      expect(smartMenuHybrid?.isStale).toBe(false);
    });
  });
});
