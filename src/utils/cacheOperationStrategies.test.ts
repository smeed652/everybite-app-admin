import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOperation,
  getOperationStrategy,
  refreshOperation,
} from "./cacheOperationStrategies";

// Mock dependencies
vi.mock("../services/base/lambdaService", () => ({
  lambdaService: {
    clearOperationCache: vi.fn(),
    clearCache: vi.fn(),
  },
}));

vi.mock("../services/smartmenus/SmartMenuSettingsHybridService", () => ({
  SmartMenuSettingsHybridService: vi.fn(),
}));

vi.mock("../services/api/lambda/MetabaseUsersService", () => ({
  MetabaseUsersService: vi.fn(),
}));

// Import after mocks
import { MetabaseUsersService } from "../services/api/lambda/MetabaseUsersService";
import { lambdaService } from "../services/base/lambdaService";
import { SmartMenuSettingsHybridService } from "../services/smartmenus/SmartMenuSettingsHybridService";

const mockLambdaService = lambdaService as any;
const mockSmartMenuSettingsHybridService =
  SmartMenuSettingsHybridService as any;
const mockMetabaseUsersService = MetabaseUsersService as any;

describe("cacheOperationStrategies", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockLambdaService.clearCache.mockResolvedValue(undefined);

    // Mock service constructors
    mockSmartMenuSettingsHybridService.mockImplementation(() => ({
      getSmartMenuSettings: vi.fn().mockResolvedValue({}),
      clearCache: vi.fn(),
    }));

    mockMetabaseUsersService.mockImplementation(() => ({
      getMetabaseUsers: vi.fn().mockResolvedValue({}),
      clearCache: vi.fn(),
    }));
  });

  describe("getOperationStrategy", () => {
    it("should return SmartMenuSettingsHybrid strategy for SmartMenuSettingsHybrid operation", () => {
      const strategy = getOperationStrategy("SmartMenuSettingsHybrid");

      expect(strategy).toBeDefined();
      expect(typeof strategy.refresh).toBe("function");
      expect(typeof strategy.clear).toBe("function");
    });

    it("should return MetabaseUsers strategy for MetabaseUsers operation", () => {
      const strategy = getOperationStrategy("MetabaseUsers");

      expect(strategy).toBeDefined();
      expect(typeof strategy.refresh).toBe("function");
      expect(typeof strategy.clear).toBe("function");
    });

    it("should return default strategy for unknown operations", () => {
      const strategy = getOperationStrategy("UnknownOperation");

      expect(strategy).toBeDefined();
      expect(typeof strategy.refresh).toBe("function");
      expect(typeof strategy.clear).toBe("function");
    });
  });

  describe("refreshOperation", () => {
    it("should refresh SmartMenuSettingsHybrid operation", async () => {
      const mockGetSmartMenuSettings = vi.fn().mockResolvedValue({});
      mockSmartMenuSettingsHybridService.mockImplementation(() => ({
        getSmartMenuSettings: mockGetSmartMenuSettings,
        clearCache: vi.fn(),
      }));

      await refreshOperation("SmartMenuSettingsHybrid");

      expect(mockLambdaService.clearCache).toHaveBeenCalled();
      expect(mockSmartMenuSettingsHybridService).toHaveBeenCalled();
      expect(mockGetSmartMenuSettings).toHaveBeenCalled();
    });

    it("should refresh MetabaseUsers operation", async () => {
      const mockGetMetabaseUsers = vi.fn().mockResolvedValue({});
      mockMetabaseUsersService.mockImplementation(() => ({
        getMetabaseUsers: mockGetMetabaseUsers,
        clearCache: vi.fn(),
      }));

      await refreshOperation("MetabaseUsers");

      expect(mockLambdaService.clearCache).toHaveBeenCalled();
      expect(mockMetabaseUsersService).toHaveBeenCalled();
      expect(mockGetMetabaseUsers).toHaveBeenCalledWith(1, 50);
    });

    it("should handle unknown operations with warning", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());

      await refreshOperation("UnknownOperation");

      expect(consoleSpy).toHaveBeenCalledWith(
        "No refresh strategy found for operation: UnknownOperation"
      );
      expect(mockLambdaService.clearCache).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("clearOperation", () => {
    it("should clear SmartMenuSettingsHybrid operation", async () => {
      const mockClearCache = vi.fn();
      mockSmartMenuSettingsHybridService.mockImplementation(() => ({
        getSmartMenuSettings: vi.fn().mockResolvedValue({}),
        clearCache: mockClearCache,
      }));

      await clearOperation("SmartMenuSettingsHybrid");

      expect(mockLambdaService.clearOperationCache).toHaveBeenCalledWith(
        "SmartMenuSettingsHybrid"
      );
      expect(mockSmartMenuSettingsHybridService).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
    });

    it("should clear MetabaseUsers operation", async () => {
      const mockClearCache = vi.fn();
      mockMetabaseUsersService.mockImplementation(() => ({
        getMetabaseUsers: vi.fn().mockResolvedValue({}),
        clearCache: mockClearCache,
      }));

      await clearOperation("MetabaseUsers");

      expect(mockLambdaService.clearOperationCache).toHaveBeenCalledWith(
        "MetabaseUsers"
      );
      expect(mockMetabaseUsersService).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
    });

    it("should clear unknown operations using default strategy", async () => {
      await clearOperation("UnknownOperation");

      expect(mockLambdaService.clearOperationCache).toHaveBeenCalledWith(
        "UnknownOperation"
      );
      expect(mockSmartMenuSettingsHybridService).not.toHaveBeenCalled();
      expect(mockMetabaseUsersService).not.toHaveBeenCalled();
    });
  });
});
