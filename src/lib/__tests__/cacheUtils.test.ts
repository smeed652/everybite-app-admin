import { beforeEach, describe, expect, it, vi } from "vitest";
import { CacheService, cacheUtils } from "../cacheUtils";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock cache config
vi.mock("../cache-config", () => ({
  getQueryTTL: vi.fn((operation: string) => {
    const ttls: Record<string, number> = {
      GetQuarterlyMetrics: 24 * 60 * 60 * 1000, // 24 hours
      GetPlayerAnalytics: 6 * 60 * 60 * 1000, // 6 hours
      GetWidget: 0, // Never cached
    };
    return ttls[operation] || 24 * 60 * 60 * 1000;
  }),
}));

describe("cacheUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.length = 0;
  });

  describe("storeInCache", () => {
    it("should store data in localStorage with correct key format", () => {
      const service: CacheService = "datawarehouse-lambda";
      const operation = "GetQuarterlyMetrics";
      const data = { test: "data" };

      cacheUtils.storeInCache(service, operation, data);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "metabase-apollo-cache-datawarehouse-lambda-GetQuarterlyMetrics",
        expect.stringContaining('"test":"data"')
      );
    });

    it("should include TTL in stored cache entry", () => {
      const service: CacheService = "datawarehouse-lambda";
      const operation = "GetQuarterlyMetrics";
      const data = { test: "data" };

      cacheUtils.storeInCache(service, operation, data);

      const storedValue = localStorageMock.setItem.mock.calls[0][1];
      const parsed = JSON.parse(storedValue);

      expect(parsed.ttl).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(parsed.operation).toBe(operation);
      expect(parsed.service).toBe(service);
    });
  });

  describe("getFromCache", () => {
    it("should return null for non-existent cache entry", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = cacheUtils.getFromCache(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(result).toBeNull();
    });

    it("should return cached data for valid entry", () => {
      const cachedEntry = {
        data: { test: "data" },
        timestamp: Date.now(),
        ttl: 24 * 60 * 60 * 1000,
        operation: "GetQuarterlyMetrics",
        service: "datawarehouse-lambda" as CacheService,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedEntry));

      const result = cacheUtils.getFromCache(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(result).toEqual({ test: "data" });
    });

    it("should return null and remove expired cache entry", () => {
      const expiredEntry = {
        data: { test: "data" },
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        ttl: 24 * 60 * 60 * 1000, // 24 hour TTL
        operation: "GetQuarterlyMetrics",
        service: "datawarehouse-lambda" as CacheService,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredEntry));

      const result = cacheUtils.getFromCache(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "metabase-apollo-cache-datawarehouse-lambda-GetQuarterlyMetrics"
      );
    });
  });

  describe("clearOperationCache", () => {
    it("should clear specific operation cache", () => {
      cacheUtils.clearOperationCache(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "metabase-apollo-cache-datawarehouse-lambda-GetQuarterlyMetrics"
      );
    });
  });

  describe("clearServiceCache", () => {
    it("should clear all cache entries for a service", () => {
      // Mock service cache keys
      localStorageMock.length = 2;
      localStorageMock.key
        .mockReturnValueOnce(
          "metabase-apollo-cache-datawarehouse-lambda-GetQuarterlyMetrics"
        )
        .mockReturnValueOnce(
          "metabase-apollo-cache-datawarehouse-lambda-GetPlayerAnalytics"
        );

      cacheUtils.clearServiceCache("datawarehouse-lambda");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "metabase-apollo-cache-datawarehouse-lambda-GetQuarterlyMetrics"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "metabase-apollo-cache-datawarehouse-lambda-GetPlayerAnalytics"
      );
    });
  });

  describe("getCacheStatus", () => {
    it("should return cache status for valid entry", () => {
      const now = Date.now();
      const cachedEntry = {
        data: { test: "data" },
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
        ttl: 24 * 60 * 60 * 1000, // 24 hour TTL
        operation: "GetQuarterlyMetrics",
        service: "datawarehouse-lambda" as CacheService,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedEntry));

      const status = cacheUtils.getCacheStatus(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(status).toEqual({
        service: "datawarehouse-lambda",
        operation: "GetQuarterlyMetrics",
        age: expect.any(Number),
        ttl: 24 * 60 * 60 * 1000,
        expiresAt: expect.any(Date),
        isExpired: false,
        size: expect.any(Number),
      });
    });

    it("should return null for non-existent cache entry", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const status = cacheUtils.getCacheStatus(
        "datawarehouse-lambda",
        "GetQuarterlyMetrics"
      );

      expect(status).toBeNull();
    });
  });
});
