import { createTestDataFactory } from "./test-patterns";

// ============================================================================
// QUARTERLY METRICS TEST DATA FACTORIES
// ============================================================================

export interface QuarterlyMetricsTestData {
  quarterLabel: string;
  brands: {
    count: number;
    qoqGrowthPercent: number;
  };
  locations: {
    count: number;
    qoqGrowthPercent: number;
  };
  activeSmartMenus: {
    count: number;
    qoqGrowthPercent: number;
  };
  orders: {
    count: number;
    qoqGrowthPercent: number;
  };
}

export const createQuarterlyMetricsFactory =
  createTestDataFactory<QuarterlyMetricsTestData>({
    quarterLabel: "Q3 2025",
    brands: {
      count: 5,
      qoqGrowthPercent: 66.7,
    },
    locations: {
      count: 28,
      qoqGrowthPercent: 12.0,
    },
    activeSmartMenus: {
      count: 3,
      qoqGrowthPercent: 50.0,
    },
    orders: {
      count: 100,
      qoqGrowthPercent: 25.0,
    },
  });

// ============================================================================
// DASHBOARD METRICS TEST DATA FACTORIES
// ============================================================================

export interface DashboardMetricsTestData {
  totalSmartMenus: number;
  activeSmartMenus: number;
  totalLocations: number;
  totalOrders: number;
  smartMenusGrowth: number;
  activeSmartMenusGrowth: number;
  locationsGrowth: number;
  ordersGrowth: number;
}

export const createDashboardMetricsFactory =
  createTestDataFactory<DashboardMetricsTestData>({
    totalSmartMenus: 4,
    activeSmartMenus: 3,
    totalLocations: 28,
    totalOrders: 100,
    smartMenusGrowth: 0,
    activeSmartMenusGrowth: 0,
    locationsGrowth: 0,
    ordersGrowth: 100.0,
  });

// ============================================================================
// WIDGET TEST DATA FACTORIES
// ============================================================================

export interface WidgetTestData {
  id: string;
  name: string;
  slug: string;
  layout: string;
  isActive: boolean;
  isOrderButtonEnabled: boolean;
  orderUrl: string;
  numberOfLocations: number;
  createdAt: string;
  updatedAt: string;
}

export const createWidgetFactory = createTestDataFactory<WidgetTestData>({
  id: "widget_1",
  name: "Lunch Menu",
  slug: "lunch-menu",
  layout: "classic",
  isActive: true,
  isOrderButtonEnabled: true,
  orderUrl: "https://example.com/order",
  numberOfLocations: 5,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-15T00:00:00Z",
});

// ============================================================================
// ANALYTICS TEST DATA FACTORIES
// ============================================================================

export interface AnalyticsTestData {
  date: string;
  interactions: number;
  orders: number;
  revenue: number;
  growth: number;
}

export const createAnalyticsFactory = createTestDataFactory<AnalyticsTestData>({
  date: "2025-01-15",
  interactions: 150,
  orders: 25,
  revenue: 500.0,
  growth: 15.5,
});

// ============================================================================
// ERROR TEST DATA FACTORIES
// ============================================================================

export interface ErrorTestData {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export const createErrorFactory = createTestDataFactory<ErrorTestData>({
  message: "Test error message",
  code: "TEST_ERROR",
  details: {},
});

// ============================================================================
// VALIDATION TEST DATA FACTORIES
// ============================================================================

export interface ValidationTestData {
  valid: boolean;
  field: string;
  value: unknown;
  expectedError?: string;
}

export const createValidationFactory =
  createTestDataFactory<ValidationTestData>({
    valid: true,
    field: "testField",
    value: "testValue",
  });

// ============================================================================
// EDGE CASE TEST DATA FACTORIES
// ============================================================================

export interface EdgeCaseTestData {
  type: "empty" | "null" | "undefined" | "max" | "min" | "zero" | "negative";
  value: unknown;
  description: string;
}

export const createEdgeCaseFactory = createTestDataFactory<EdgeCaseTestData>({
  type: "empty",
  value: "",
  description: "Empty string value",
});

// ============================================================================
// PERFORMANCE TEST DATA FACTORIES
// ============================================================================

export interface PerformanceTestData {
  size: "small" | "medium" | "large" | "xlarge";
  itemCount: number;
  complexity: "simple" | "moderate" | "complex";
}

export const createPerformanceFactory =
  createTestDataFactory<PerformanceTestData>({
    size: "medium",
    itemCount: 100,
    complexity: "moderate",
  });

// ============================================================================
// BUSINESS RULE TEST DATA FACTORIES
// ============================================================================

export interface BusinessRuleTestData {
  rule: string;
  input: unknown;
  expected: unknown;
  description: string;
}

export const createBusinessRuleFactory =
  createTestDataFactory<BusinessRuleTestData>({
    rule: "default_rule",
    input: {},
    expected: {},
    description: "Default business rule test",
  });

// ============================================================================
// CONTRACT TEST DATA FACTORIES
// ============================================================================

export interface ContractTestData {
  operation: string;
  input: unknown;
  expectedOutput: unknown;
  expectedError?: string;
  timeout?: number;
}

export const createContractFactory = createTestDataFactory<ContractTestData>({
  operation: "test_operation",
  input: {},
  expectedOutput: {},
  timeout: 5000,
});

// ============================================================================
// TEST DATA BUILDER UTILITIES
// ============================================================================

/**
 * Create a comprehensive test data set for business logic testing
 */
export function createComprehensiveTestDataSet() {
  return {
    quarterlyMetrics: {
      valid: createQuarterlyMetricsFactory(),
      empty: createQuarterlyMetricsFactory({
        quarterLabel: "",
        brands: { count: 0, qoqGrowthPercent: 0 },
        locations: { count: 0, qoqGrowthPercent: 0 },
        activeSmartMenus: { count: 0, qoqGrowthPercent: 0 },
        orders: { count: 0, qoqGrowthPercent: 0 },
      }),
      edgeCases: [
        createQuarterlyMetricsFactory({
          brands: { count: -1, qoqGrowthPercent: -100 },
        }),
        createQuarterlyMetricsFactory({
          orders: { count: Number.MAX_SAFE_INTEGER, qoqGrowthPercent: 999999 },
        }),
        createQuarterlyMetricsFactory({ quarterLabel: null as any }),
      ],
    },
    dashboardMetrics: {
      valid: createDashboardMetricsFactory(),
      empty: createDashboardMetricsFactory({
        totalSmartMenus: 0,
        activeSmartMenus: 0,
        totalLocations: 0,
        totalOrders: 0,
        smartMenusGrowth: 0,
        activeSmartMenusGrowth: 0,
        locationsGrowth: 0,
        ordersGrowth: 0,
      }),
      edgeCases: [
        createDashboardMetricsFactory({ totalOrders: -1 }),
        createDashboardMetricsFactory({ ordersGrowth: 999999 }),
        createDashboardMetricsFactory({ totalSmartMenus: null as any }),
      ],
    },
    widgets: {
      valid: createWidgetFactory(),
      inactive: createWidgetFactory({ isActive: false }),
      edgeCases: [
        createWidgetFactory({ id: "" }),
        createWidgetFactory({ numberOfLocations: -1 }),
        createWidgetFactory({ name: null as any }),
      ],
    },
    analytics: {
      valid: createAnalyticsFactory(),
      zero: createAnalyticsFactory({
        interactions: 0,
        orders: 0,
        revenue: 0,
        growth: 0,
      }),
      edgeCases: [
        createAnalyticsFactory({ revenue: -100 }),
        createAnalyticsFactory({ growth: 999999 }),
        createAnalyticsFactory({ date: null as any }),
      ],
    },
  };
}

/**
 * Create test data for specific business logic scenarios
 */
export function createScenarioTestData(scenario: string) {
  const scenarios = {
    "quarterly-metrics-normal": {
      input: createQuarterlyMetricsFactory(),
      expected: {
        quarter: "Q3 2025",
        brands: 5,
        locations: 28,
        activeSmartMenus: 3,
        orders: 100,
        ordersQoQGrowth: 25.0,
      },
    },
    "quarterly-metrics-empty": {
      input: createQuarterlyMetricsFactory({
        quarterLabel: "",
        brands: { count: 0, qoqGrowthPercent: 0 },
        locations: { count: 0, qoqGrowthPercent: 0 },
        activeSmartMenus: { count: 0, qoqGrowthPercent: 0 },
        orders: { count: 0, qoqGrowthPercent: 0 },
      }),
      expected: {
        quarter: "Unknown Quarter",
        brands: 0,
        locations: 0,
        activeSmartMenus: 0,
        orders: 0,
        ordersQoQGrowth: 0,
      },
    },
    "dashboard-calculations": {
      input: createDashboardMetricsFactory(),
      expected: {
        totalSmartMenus: 4,
        activeSmartMenus: 3,
        totalLocations: 28,
        totalOrders: 100,
        smartMenusGrowth: 0,
        activeSmartMenusGrowth: 0,
        locationsGrowth: 0,
        ordersGrowth: 100.0,
      },
    },
    "widget-validation": {
      input: createWidgetFactory(),
      expected: {
        isValid: true,
        errors: [],
      },
    },
  };

  return (
    scenarios[scenario as keyof typeof scenarios] ||
    scenarios["quarterly-metrics-normal"]
  );
}
