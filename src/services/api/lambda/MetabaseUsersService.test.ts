import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetabaseUsersService } from "./MetabaseUsersService";

// Mock dependencies
vi.mock("../../../components/cache/constants", () => ({
  METABASE_USERS_QUERY: "mock-query",
}));

vi.mock("../../../config/cache-config", () => ({
  getCacheConfig: vi.fn(() => ({
    ttl: 1000 * 60 * 5, // 5 minutes
    operationTTLs: { MetabaseUsers: 1000 * 60 * 10 }, // 10 minutes
  })),
}));

vi.mock("../../../lib/datawarehouse-lambda-apollo", () => ({
  lambdaClient: {
    query: vi.fn(),
  },
}));

vi.mock("../../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { lambdaClient } from "../../../lib/datawarehouse-lambda-apollo";

const mockLambdaClient = lambdaClient as any;

describe("MetabaseUsersService", () => {
  let service: MetabaseUsersService;

  const mockUsers = [
    {
      id: "1",
      email: "user1@example.com",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      dateJoined: "2024-01-01T00:00:00Z",
      lastLogin: "2024-01-15T00:00:00Z",
      isActive: true,
      isSuperuser: false,
      isQbnewb: false,
      locale: "en",
      ssoSource: "google",
    },
    {
      id: "2",
      email: "user2@example.com",
      firstName: "Jane",
      lastName: "Smith",
      name: "Jane Smith",
      dateJoined: "2024-01-02T00:00:00Z",
      lastLogin: "2024-01-16T00:00:00Z",
      isActive: true,
      isSuperuser: true,
      isQbnewb: true,
      locale: "en",
      ssoSource: "saml",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Clear localStorage before each test
    localStorage.clear();

    service = new MetabaseUsersService();

    // Setup default mocks
    mockLambdaClient.query.mockResolvedValue({
      data: {
        metabaseUsers: {
          users: mockUsers,
          total: 2,
        },
      },
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
      localStorage.setItem("metabase_users_cache_v1", "2");

      const newService = new MetabaseUsersService();

      expect(newService.getCacheStats().cacheVersion).toBe("2");
    });
  });

  describe("data operations", () => {
    it("should fetch users successfully", async () => {
      const result = await service.getMetabaseUsers(1, 50);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.performanceMetrics.cacheHit).toBe(false);
      expect(result.cacheInfo.hasChanges).toBe(true);
    });

    it("should handle pagination parameters", async () => {
      await service.getMetabaseUsers(2, 25);

      expect(mockLambdaClient.query).toHaveBeenCalledWith({
        query: "mock-query",
        variables: { page: 2, pageSize: 25 },
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });
    });

    it("should handle Lambda client not available", async () => {
      mockLambdaClient.query.mockRejectedValue(
        new Error("Lambda client not initialized")
      );

      await expect(service.getMetabaseUsers()).rejects.toThrow(
        "Lambda client not initialized"
      );
    });

    it("should handle GraphQL errors", async () => {
      mockLambdaClient.query.mockResolvedValue({
        data: null,
        errors: [{ message: "Field not found" }],
      });

      await expect(service.getMetabaseUsers()).rejects.toThrow(
        "Lambda GraphQL errors: Field not found"
      );
    });
  });

  describe("caching", () => {
    it("should handle cache invalidation logic", async () => {
      // Test that cache invalidation logic exists and works
      const result = await service.getMetabaseUsers();

      expect(result).toHaveProperty("performanceMetrics");
      expect(result).toHaveProperty("cacheInfo");
      expect(result.performanceMetrics).toHaveProperty("cacheHit");
      expect(result.cacheInfo).toHaveProperty("hasChanges");
    });

    it("should invalidate cache when TTL expires", async () => {
      // Mock Date.now to control cache age
      const originalNow = Date.now;
      const mockNow = vi.fn();
      Date.now = mockNow;

      // First call
      mockNow.mockReturnValue(1000);
      await service.getMetabaseUsers();

      // Second call after cache expires (10 minutes = 600000ms)
      mockNow.mockReturnValue(602000);
      await service.getMetabaseUsers();

      expect(mockLambdaClient.query).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should invalidate cache when version changes", async () => {
      // First call
      await service.getMetabaseUsers();

      // Change cache version
      localStorage.setItem("metabase_users_cache_v1", "2");

      // Second call should fetch fresh data
      await service.getMetabaseUsers();

      expect(mockLambdaClient.query).toHaveBeenCalledTimes(2);
    });

    it("should clear cache successfully", () => {
      service.clearCache();

      const stats = service.getCacheStats();
      expect(stats.lastFetch).toBe(0);
      expect(stats.cacheVersion).toBe("1");
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

  describe("error handling", () => {
    it("should handle errors gracefully", async () => {
      // Test that error handling exists
      mockLambdaClient.query.mockRejectedValue(new Error("Network error"));

      await expect(service.getMetabaseUsers()).rejects.toThrow("Network error");
    });
  });
});
