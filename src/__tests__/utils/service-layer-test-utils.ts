/**
 * Service Layer Test Utilities
 *
 * Comprehensive utilities for testing service layer components with edge cases,
 * error scenarios, and performance validation.
 */

import { vi } from "vitest";

// Mock data factories for consistent test data
export const createMockWidget = (overrides = {}) => ({
  id: "test-widget-1",
  name: "Test Widget",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  __typename: "Widget",
  ...overrides,
});

export const createMockQuarterlyMetrics = (overrides = {}) => ({
  quarter: "Q4",
  year: 2024,
  quarterLabel: "Q4 2024",
  brands: { count: 38, qoqGrowth: 5, qoqGrowthPercent: 15.2 },
  locations: { count: 1200, qoqGrowth: 200, qoqGrowthPercent: 20.0 },
  orders: { count: 5000, qoqGrowth: 1000, qoqGrowthPercent: 25.0 },
  activeSmartMenus: { count: 25, qoqGrowth: 3, qoqGrowthPercent: 13.6 },
  totalRevenue: { amount: 150000, qoqGrowth: 25000, qoqGrowthPercent: 20.0 },
  ...overrides,
});

export const createMockDashboardMetrics = (overrides = {}) => ({
  widgetSummary: {
    totalWidgets: 100,
    activeWidgets: 85,
    totalLocations: 1200,
    totalOrders: 5000,
    averageOrdersPerWidget: 58.8,
  },
  quarterlyMetrics: [createMockQuarterlyMetrics()],
  kpis: {
    totalRevenue: 150000,
    totalDinerVisits: 2500,
    averageOrderValue: 60.0,
    conversionRate: 0.15,
  },
  ...overrides,
});

// Error scenario factories
export const createGraphQLError = (message: string, path?: string[]) => ({
  message,
  path,
  extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
});

export const createNetworkError = (statusCode: number, message: string) => ({
  name: "NetworkError",
  message,
  statusCode,
  bodyText: message,
  result: { error: message },
  stack: "Error stack",
});

export const createApolloError = (
  graphQLErrors?: any[],
  networkError?: any
) => {
  const error = new Error("Apollo Error") as any;
  error.graphQLErrors = graphQLErrors || [];
  error.networkError = networkError;
  return error;
};

// Performance test utilities
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  maxTimeMs: number = 5000
): Promise<{ result: T; duration: number; withinLimit: boolean }> => {
  const startTime = performance.now();
  const result = await operation();
  const endTime = performance.now();
  const duration = endTime - startTime;

  return {
    result,
    duration,
    withinLimit: duration <= maxTimeMs,
  };
};

// Retry utilities for flaky tests
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        throw lastError;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
};

// Cache testing utilities
export const createMockCache = () => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
});

export const createMockCacheStats = (overrides = {}) => ({
  lastFetch: Date.now(),
  cacheVersion: "1",
  cacheAge: 0,
  hitCount: 0,
  missCount: 0,
  ...overrides,
});

// Service layer test helpers
export const createMockServiceResponse = <T>(
  data: T,
  success: boolean = true,
  error?: string
) => ({
  data,
  success,
  error,
  timestamp: Date.now(),
});

export const createMockHybridServiceResponse = (overrides = {}) => ({
  smartMenus: [createMockWidget()],
  quarterlyMetrics: [createMockQuarterlyMetrics()],
  performanceMetrics: {
    mainApiTime: 150,
    lambdaTime: 200,
    totalTime: 350,
    cacheHit: false,
  },
  cacheInfo: {
    lastFetch: Date.now(),
    cacheVersion: "1",
    hasChanges: false,
  },
  ...overrides,
});

// Edge case test data
export const createEdgeCaseData = {
  emptyWidget: createMockWidget({
    id: "",
    name: "",
    isActive: false,
  }),

  veryLongName: createMockWidget({
    name: "A".repeat(1000),
  }),

  specialCharacters: createMockWidget({
    name: "Widget with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?",
  }),

  unicodeCharacters: createMockWidget({
    name: "Widget with unicode: 🍕🍔🌮🎉",
  }),

  nullValues: createMockWidget({
    name: null as any,
    isActive: null as any,
  }),

  undefinedValues: createMockWidget({
    name: undefined as any,
    isActive: undefined as any,
  }),

  extremeNumbers: createMockQuarterlyMetrics({
    brands: {
      count: Number.MAX_SAFE_INTEGER,
      qoqGrowth: Number.MIN_SAFE_INTEGER,
      qoqGrowthPercent: 999.99,
    },
    orders: { count: 0, qoqGrowth: 0, qoqGrowthPercent: 0 },
  }),
};

// Test environment utilities
export const setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console };
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();

  return {
    restore: () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    },
  };
};

// Async operation testing utilities
export const createAsyncMock = <T>(result: T, delayMs: number = 100) => {
  return vi
    .fn()
    .mockImplementation(
      () =>
        new Promise<T>((resolve) => setTimeout(() => resolve(result), delayMs))
    );
};

export const createAsyncErrorMock = (error: Error, delayMs: number = 100) => {
  return vi
    .fn()
    .mockImplementation(
      () =>
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(error), delayMs)
        )
    );
};

// Validation utilities
export const validateResponseStructure = (
  response: any,
  expectedKeys: string[]
) => {
  expect(response).toBeDefined();
  expectedKeys.forEach((key) => {
    expect(response).toHaveProperty(key);
  });
};

export const validatePerformanceMetrics = (metrics: any) => {
  expect(metrics).toBeDefined();
  expect(typeof metrics.totalTime).toBe("number");
  expect(metrics.totalTime).toBeGreaterThan(0);
  expect(metrics.totalTime).toBeLessThan(30000); // 30s max
};

// Export all utilities
export default {
  createMockWidget,
  createMockQuarterlyMetrics,
  createMockDashboardMetrics,
  createGraphQLError,
  createNetworkError,
  createApolloError,
  measurePerformance,
  retryOperation,
  createMockCache,
  createMockCacheStats,
  createMockServiceResponse,
  createMockHybridServiceResponse,
  createEdgeCaseData,
  setupTestEnvironment,
  createAsyncMock,
  createAsyncErrorMock,
  validateResponseStructure,
  validatePerformanceMetrics,
};
