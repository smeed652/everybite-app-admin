import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock console methods
const mockConsole = {
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

Object.defineProperty(console, "warn", {
  value: mockConsole.warn,
});

Object.defineProperty(console, "error", {
  value: mockConsole.error,
});

Object.defineProperty(console, "log", {
  value: mockConsole.log,
});

// Import after mocks
import {
  getCacheConfig,
  getQueryTTL,
  setCacheConfig,
  updateOperationTTL,
  type CacheConfig,
} from "./cache-config";

describe("cache-config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockConsole.warn.mockImplementation(() => {});
    mockConsole.error.mockImplementation(() => {});
    mockConsole.log.mockImplementation(() => {});
  });

  describe("getCacheConfig", () => {
    it("returns default config when no localStorage value", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const config = getCacheConfig();

      expect(config).toEqual({
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        scheduledRefresh: {
          enabled: true,
          time: "06:00",
          timezone: "America/Los_Angeles",
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: true,
        operationTTLs: {
          GetWidget: 0,
          GetWidgets: 0,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      });
    });

    it("returns merged config when localStorage has partial config", () => {
      const storedConfig = {
        ttl: 12 * 60 * 60 * 1000, // 12 hours
        enableCaching: false,
        operationTTLs: {
          GetWidget: 3600000, // 1 hour
        },
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      const config = getCacheConfig();

      expect(config.ttl).toBe(12 * 60 * 60 * 1000);
      expect(config.enableCaching).toBe(false);
      expect(config.scheduledRefresh.enabled).toBe(true); // from default
      expect(config.operationTTLs.GetWidget).toBe(3600000);
      expect(config.operationTTLs.GetWidgets).toBe(0); // from default
    });

    it("handles operationTTLs stored as JSON string", () => {
      const storedConfig = {
        operationTTLs: JSON.stringify({
          GetWidget: 3600000,
        }),
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      const config = getCacheConfig();

      expect(config.operationTTLs.GetWidget).toBe(3600000);
      expect(config.operationTTLs.GetWidgets).toBe(0); // from default
    });

    it("handles invalid operationTTLs JSON string", () => {
      const storedConfig = {
        operationTTLs: "invalid json",
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      const config = getCacheConfig();

      expect(config.operationTTLs).toEqual({
        GetWidget: 0,
        GetWidgets: 0,
        GetSmartMenus: 0,
        GetUser: 0,
      });
      expect(mockConsole.warn).toHaveBeenCalledWith(
        "[CacheConfig] Error parsing operationTTLs string:",
        expect.any(Error)
      );
    });

    it("handles localStorage getItem error", () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const config = getCacheConfig();

      expect(config).toEqual({
        ttl: 24 * 60 * 60 * 1000,
        scheduledRefresh: {
          enabled: true,
          time: "06:00",
          timezone: "America/Los_Angeles",
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: true,
        operationTTLs: {
          GetWidget: 0,
          GetWidgets: 0,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      });
      expect(mockConsole.warn).toHaveBeenCalledWith(
        "[CacheConfig] Error reading cache config:",
        expect.any(Error)
      );
    });

    it("handles invalid JSON in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const config = getCacheConfig();

      expect(config).toEqual({
        ttl: 24 * 60 * 60 * 1000,
        scheduledRefresh: {
          enabled: true,
          time: "06:00",
          timezone: "America/Los_Angeles",
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: true,
        operationTTLs: {
          GetWidget: 0,
          GetWidgets: 0,
          GetSmartMenus: 0,
          GetUser: 0,
        },
      });
      expect(mockConsole.warn).toHaveBeenCalledWith(
        "[CacheConfig] Error reading cache config:",
        expect.any(Error)
      );
    });
  });

  describe("setCacheConfig", () => {
    it("saves config to localStorage", () => {
      const config: CacheConfig = {
        ttl: 12 * 60 * 60 * 1000,
        scheduledRefresh: {
          enabled: false,
          time: "12:00",
          timezone: "UTC",
        },
        storage: {
          prefix: "test-cache",
          persistence: false,
        },
        enableCaching: false,
        operationTTLs: {
          GetWidget: 3600000,
        },
      };

      setCacheConfig(config);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "cacheConfig",
        JSON.stringify(config)
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        "[CacheConfig] Cache configuration updated:",
        config
      );
    });

    it("handles localStorage setItem error", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const config: CacheConfig = {
        ttl: 12 * 60 * 60 * 1000,
        scheduledRefresh: {
          enabled: true,
          time: "06:00",
          timezone: "America/Los_Angeles",
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: true,
        operationTTLs: {},
      };

      setCacheConfig(config);

      expect(mockConsole.error).toHaveBeenCalledWith(
        "[CacheConfig] Error saving cache config:",
        expect.any(Error)
      );
    });
  });

  describe("getQueryTTL", () => {
    it("returns operation-specific TTL when available", () => {
      const storedConfig = {
        operationTTLs: {
          GetWidget: 3600000, // 1 hour
        },
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      const ttl = getQueryTTL("GetWidget");

      expect(ttl).toBe(3600000);
    });

    it("returns default TTL when operation not found", () => {
      const storedConfig = {
        ttl: 12 * 60 * 60 * 1000, // 12 hours
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      const ttl = getQueryTTL("UnknownOperation");

      expect(ttl).toBe(12 * 60 * 60 * 1000);
    });

    it("returns default TTL when no config available", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const ttl = getQueryTTL("UnknownOperation");

      expect(ttl).toBe(24 * 60 * 60 * 1000); // default 24 hours
    });
  });

  describe("updateOperationTTL", () => {
    it("updates operation TTL and saves config", () => {
      const storedConfig = {
        ttl: 24 * 60 * 60 * 1000,
        operationTTLs: {
          GetWidget: 3600000,
        },
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      updateOperationTTL("GetWidget", 2); // 2 hours

      const savedConfig = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedConfig.operationTTLs.GetWidget).toBe(2 * 60 * 60 * 1000); // 2 hours in milliseconds
      expect(savedConfig.ttl).toBe(24 * 60 * 60 * 1000); // default TTL
    });

    it("creates new operation TTL when not exists", () => {
      const storedConfig = {
        ttl: 24 * 60 * 60 * 1000,
        operationTTLs: {},
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      updateOperationTTL("NewOperation", 1); // 1 hour

      const savedConfig = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedConfig.operationTTLs.NewOperation).toBe(1 * 60 * 60 * 1000); // 1 hour in milliseconds
      expect(savedConfig.operationTTLs.GetWidget).toBe(0); // default value
    });

    it("converts hours to milliseconds correctly", () => {
      const storedConfig = {
        ttl: 24 * 60 * 60 * 1000,
        operationTTLs: {},
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));

      updateOperationTTL("TestOperation", 0.5); // 30 minutes

      const savedConfig = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedConfig.operationTTLs.TestOperation).toBe(
        0.5 * 60 * 60 * 1000
      ); // 30 minutes in milliseconds
      expect(savedConfig.operationTTLs.GetWidget).toBe(0); // default value
    });
  });
});
