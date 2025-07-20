/**
 * Mock Detection Utilities
 *
 * These utilities help detect when global mocks are being used that could
 * interfere with the real application.
 */

import { vi } from "vitest";

/**
 * Critical modules that should not be globally mocked
 * as they can interfere with real application functionality
 */
const CRITICAL_MODULES = [
  "datawarehouse-lambda-apollo",
  "api-graphql-apollo",
  "lambdaClient",
  "apiGraphQLClient",
  "metabaseApolloClient",
];

/**
 * Detects if any critical modules are being globally mocked
 */
export const detectGlobalMocks = (): string[] => {
  const mockedModules: string[] = [];

  // Check if any critical modules are mocked
  CRITICAL_MODULES.forEach((moduleName) => {
    try {
      // Try to access the module - if it's mocked, this will work
      const module = require(`../../lib/${moduleName}`);
      if (module && typeof module === "object") {
        // Check if it's a mock by looking for vi.fn properties
        const hasMockProperties = Object.values(module).some(
          (value: any) =>
            value && typeof value === "object" && value._isMockFunction
        );

        if (hasMockProperties) {
          mockedModules.push(moduleName);
        }
      }
    } catch (error) {
      // Module doesn't exist or can't be accessed
    }
  });

  return mockedModules;
};

/**
 * Warns if global mocks are detected
 */
export const warnIfGlobalMocks = (): void => {
  const mockedModules = detectGlobalMocks();

  if (mockedModules.length > 0) {
    console.warn(
      "🚨 Global mocks detected that could interfere with real application:"
    );
    mockedModules.forEach((module) => {
      console.warn(`   - ${module}`);
    });
    console.warn(
      "   Consider using local mocks or dependency injection instead."
    );
  }
};

/**
 * Validates that no critical modules are mocked in the current test
 */
export const validateNoGlobalMocks = (): void => {
  const mockedModules = detectGlobalMocks();

  if (mockedModules.length > 0) {
    throw new Error(
      `Critical modules are globally mocked and could interfere with real application: ${mockedModules.join(", ")}. ` +
        "Use local mocks or dependency injection instead."
    );
  }
};

/**
 * Creates a test wrapper that validates no global mocks are used
 */
export const withMockValidation = (testFn: () => void | Promise<void>) => {
  return async () => {
    // Check before test
    validateNoGlobalMocks();

    // Run test
    await testFn();

    // Check after test
    validateNoGlobalMocks();
  };
};

/**
 * Test environment setup that includes mock validation
 */
export const setupTestEnvironment = () => {
  // Ensure we're in test environment
  process.env.NODE_ENV = "test";

  // Clear any existing mocks
  vi.clearAllMocks();

  // Warn about any global mocks
  warnIfGlobalMocks();

  // Setup test-specific configurations
  vi.stubEnv("VITE_API_KEY", "test-api-key");
  vi.stubEnv(
    "VITE_LAMBDA_GRAPHQL_URI",
    "https://test-lambda.example.com/graphql"
  );
};

/**
 * Cleanup function to restore original modules
 */
export const cleanupTestEnvironment = () => {
  // Restore any stubbed environment variables
  vi.unstubAllEnvs();

  // Clear all mocks
  vi.clearAllMocks();

  // Restore any mocked modules
  vi.doUnmock("../../lib/datawarehouse-lambda-apollo");
  vi.doUnmock("../../lib/api-graphql-apollo");
};

/**
 * Hook to use in test files to automatically validate mocks
 */
export const useMockValidation = () => {
  beforeEach(() => {
    validateNoGlobalMocks();
  });

  afterEach(() => {
    validateNoGlobalMocks();
  });
};
