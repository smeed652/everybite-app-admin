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

// Mock window.location
const mockLocation = {
  hostname: "localhost",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock import.meta.env
const mockImportMetaEnv: Record<string, string | undefined> = {
  VITE_GRAPHQL_URI: "https://test-api.com/graphql",
  VITE_COGNITO_USER_POOL_ID: "test-pool-id",
  VITE_COGNITO_APP_CLIENT_ID: "test-client-id",
  VITE_LOG_LEVEL: "debug",
  VITE_SENTRY_DSN: "test-sentry-dsn",
  VITE_ENABLE_CACHING: "true",
  MODE: "development",
};

Object.defineProperty(import.meta, "env", {
  value: mockImportMetaEnv,
  writable: true,
});

// Import after mocks
import {
  config,
  currentEnvironment,
  features,
  isDevelopment,
  isProduction,
  isStaging,
} from "./environments";

describe("environments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  describe("environment configuration", () => {
    it("provides configuration with expected structure", () => {
      expect(config).toHaveProperty("name");
      expect(config).toHaveProperty("apiUrl");
      expect(config).toHaveProperty("cognitoUserPoolId");
      expect(config).toHaveProperty("cognitoClientId");
      expect(config).toHaveProperty("logLevel");
      expect(config).toHaveProperty("features");
      expect(config.features).toHaveProperty("analytics");
      expect(config.features).toHaveProperty("notifications");
      expect(config.features).toHaveProperty("debugMode");
      expect(config.features).toHaveProperty("caching");
    });

    it("provides development configuration when hostname is localhost", () => {
      expect(config.name).toBe("Development");
      expect(config.apiUrl).toBe("https://api.everybite.com/graphql");
      expect(typeof config.cognitoUserPoolId).toBe("string");
      expect(typeof config.cognitoClientId).toBe("string");
      expect(config.logLevel).toBe("debug");
      expect(config.sentryDsn).toBeUndefined();
      expect(config.features.analytics).toBe(false);
      expect(config.features.notifications).toBe(false);
      expect(config.features.debugMode).toBe(true);
      expect(config.features.caching).toBe(true);
    });
  });

  describe("environment helpers", () => {
    it("provides boolean environment flags", () => {
      expect(typeof isDevelopment).toBe("boolean");
      expect(typeof isStaging).toBe("boolean");
      expect(typeof isProduction).toBe("boolean");
    });

    it("correctly identifies development environment for localhost", () => {
      expect(isDevelopment).toBe(true);
      expect(isStaging).toBe(false);
      expect(isProduction).toBe(false);
    });
  });

  describe("feature flags", () => {
    it("provides caching feature flag", () => {
      expect(typeof features.caching).toBe("boolean");
    });

    it("provides caching feature flag from environment", () => {
      mockImportMetaEnv.VITE_ENABLE_CACHING = "true";
      expect(features.caching).toBe(true);
    });

    it("provides caching feature flag from localStorage override", () => {
      mockImportMetaEnv.VITE_ENABLE_CACHING = "false";
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          enableCaching: true,
        })
      );

      expect(features.caching).toBe(true);
    });

    it("falls back to environment caching flag when no localStorage override", () => {
      mockImportMetaEnv.VITE_ENABLE_CACHING = "false";
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(features.caching).toBe(true);
    });

    it("handles invalid localStorage cache config", () => {
      mockImportMetaEnv.VITE_ENABLE_CACHING = "true";
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      expect(features.caching).toBe(true); // falls back to env var
    });
  });

  describe("environment detection", () => {
    it("provides current environment string", () => {
      expect(typeof currentEnvironment).toBe("string");
      expect(["development", "staging", "production"]).toContain(
        currentEnvironment
      );
    });

    it("detects development environment for localhost", () => {
      expect(currentEnvironment).toBe("development");
    });
  });
});
