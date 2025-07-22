import { describe, expect, it } from "vitest";
import {
  createBusinessLogicTestSuite,
  createDashboardMetricsFactory,
  createQuarterlyMetricsFactory,
  testBusinessRules,
  testDataTransformation,
  testEdgeCases,
  testNullHandling,
  testPerformance,
  testPureFunction,
  validatePureFunction,
} from "./index";

// ============================================================================
// EXAMPLE BUSINESS LOGIC FUNCTIONS
// ============================================================================

/**
 * Example business logic function: Calculate quarterly metrics summary
 */
function calculateQuarterlyMetricsSummary(data: any) {
  if (!data || !data.quarterLabel) {
    return {
      quarter: "Unknown Quarter",
      brands: data?.brands?.count || 0,
      locations: data?.locations?.count || 0,
      activeSmartMenus: data?.activeSmartMenus?.count || 0,
      orders: data?.orders?.count || 0,
      ordersQoQGrowth: data?.orders?.qoqGrowthPercent || 0,
    };
  }

  return {
    quarter: data.quarterLabel,
    brands: data.brands?.count || 0,
    locations: data.locations?.count || 0,
    activeSmartMenus: data.activeSmartMenus?.count || 0,
    orders: data.orders?.count || 0,
    ordersQoQGrowth: data.orders?.qoqGrowthPercent || 0,
  };
}

/**
 * Example business logic function: Calculate dashboard metrics
 */
function calculateDashboardMetrics(data: any) {
  if (!data) {
    return {
      totalSmartMenus: 0,
      activeSmartMenus: 0,
      totalLocations: 0,
      totalOrders: 0,
      smartMenusGrowth: 0,
      activeSmartMenusGrowth: 0,
      locationsGrowth: 0,
      ordersGrowth: 0,
    };
  }

  return {
    totalSmartMenus: data.totalSmartMenus || 0,
    activeSmartMenus: data.activeSmartMenus || 0,
    totalLocations: data.totalLocations || 0,
    totalOrders: data.totalOrders || 0,
    smartMenusGrowth: data.smartMenusGrowth || 0,
    activeSmartMenusGrowth: data.activeSmartMenusGrowth || 0,
    locationsGrowth: data.locationsGrowth || 0,
    ordersGrowth: data.ordersGrowth || 0,
  };
}

/**
 * Example business logic function: Validate widget data
 */
function validateWidgetData(widget: any) {
  const errors: string[] = [];

  if (!widget?.id) {
    errors.push("Widget ID is required");
  }

  if (!widget?.name) {
    errors.push("Widget name is required");
  }

  if (widget?.numberOfLocations < 0) {
    errors.push("Number of locations cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// EXAMPLE TESTS USING NEW PATTERNS
// ============================================================================

describe("Business Logic Testing Patterns - Example Usage", () => {
  // ============================================================================
  // EXAMPLE 1: Using createBusinessLogicTestSuite
  // ============================================================================

  describe("calculateQuarterlyMetricsSummary - Comprehensive Test Suite", () => {
    createBusinessLogicTestSuite({
      functionName: "calculateQuarterlyMetricsSummary",
      testFunction: calculateQuarterlyMetricsSummary,
      pureFunctionTests: [
        {
          name: "transform valid quarterly data",
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
        {
          name: "handle empty data",
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
      ],
      edgeCases: [
        {
          name: "null input",
          input: null,
          expected: {
            quarter: "Unknown Quarter",
            brands: 0,
            locations: 0,
            activeSmartMenus: 0,
            orders: 0,
            ordersQoQGrowth: 0,
          },
        },
        {
          name: "undefined input",
          input: undefined,
          expected: {
            quarter: "Unknown Quarter",
            brands: 0,
            locations: 0,
            activeSmartMenus: 0,
            orders: 0,
            ordersQoQGrowth: 0,
          },
        },
      ],
      businessRules: [
        {
          rule: "should return unknown quarter for missing quarterLabel",
          input: { brands: { count: 5 } },
          expected: {
            quarter: "Unknown Quarter",
            brands: 5,
            locations: 0,
            activeSmartMenus: 0,
            orders: 0,
            ordersQoQGrowth: 0,
          },
        },
        {
          rule: "should handle missing nested properties",
          input: { quarterLabel: "Q1 2025" },
          expected: {
            quarter: "Q1 2025",
            brands: 0,
            locations: 0,
            activeSmartMenus: 0,
            orders: 0,
            ordersQoQGrowth: 0,
          },
        },
      ],
      performanceTests: [
        {
          name: "large dataset processing",
          input: createQuarterlyMetricsFactory(),
          maxExecutionTime: 10, // 10ms
        },
      ],
    });
  });

  // ============================================================================
  // EXAMPLE 2: Using individual test patterns
  // ============================================================================

  describe("calculateDashboardMetrics - Individual Pattern Tests", () => {
    testPureFunction("calculateDashboardMetrics", calculateDashboardMetrics, [
      {
        name: "transform valid dashboard data",
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
    ]);

    testEdgeCases("calculateDashboardMetrics", calculateDashboardMetrics, [
      {
        name: "null input",
        input: null,
        expected: {
          totalSmartMenus: 0,
          activeSmartMenus: 0,
          totalLocations: 0,
          totalOrders: 0,
          smartMenusGrowth: 0,
          activeSmartMenusGrowth: 0,
          locationsGrowth: 0,
          ordersGrowth: 0,
        },
      },
    ]);

    testDataTransformation(
      "calculateDashboardMetrics",
      calculateDashboardMetrics,
      [
        {
          name: "dashboard data transformation",
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
          validation: (result) => {
            expect(result.totalSmartMenus).toBeGreaterThanOrEqual(0);
            expect(result.activeSmartMenus).toBeLessThanOrEqual(
              result.totalSmartMenus
            );
          },
        },
      ]
    );
  });

  // ============================================================================
  // EXAMPLE 3: Using validation patterns
  // ============================================================================

  describe("validateWidgetData - Validation Pattern Tests", () => {
    testBusinessRules("validateWidgetData", validateWidgetData, [
      {
        rule: "should validate complete widget data",
        input: {
          id: "widget_1",
          name: "Test Widget",
          numberOfLocations: 5,
        },
        expected: {
          isValid: true,
          errors: [],
        },
      },
      {
        rule: "should reject widget without ID",
        input: {
          name: "Test Widget",
          numberOfLocations: 5,
        },
        expected: {
          isValid: false,
          errors: ["Widget ID is required"],
        },
      },
      {
        rule: "should reject widget without name",
        input: {
          id: "widget_1",
          numberOfLocations: 5,
        },
        expected: {
          isValid: false,
          errors: ["Widget name is required"],
        },
      },
      {
        rule: "should reject widget with negative locations",
        input: {
          id: "widget_1",
          name: "Test Widget",
          numberOfLocations: -1,
        },
        expected: {
          isValid: false,
          errors: ["Number of locations cannot be negative"],
        },
      },
    ]);

    testNullHandling("validateWidgetData", validateWidgetData, [
      {
        name: "null input",
        input: null,
        expected: {
          isValid: false,
          errors: ["Widget ID is required", "Widget name is required"],
        },
      },
      {
        name: "undefined input",
        input: undefined,
        expected: {
          isValid: false,
          errors: ["Widget ID is required", "Widget name is required"],
        },
      },
    ]);
  });

  // ============================================================================
  // EXAMPLE 4: Using performance and pure function validation
  // ============================================================================

  describe("Performance and Pure Function Validation", () => {
    testPerformance(
      "calculateQuarterlyMetricsSummary",
      calculateQuarterlyMetricsSummary,
      [
        {
          name: "standard performance test",
          input: createQuarterlyMetricsFactory(),
          maxExecutionTime: 5, // 5ms
        },
      ]
    );

    validatePureFunction(
      "calculateQuarterlyMetricsSummary",
      calculateQuarterlyMetricsSummary,
      createQuarterlyMetricsFactory(),
      5 // 5 iterations
    );
  });

  // ============================================================================
  // EXAMPLE 5: Manual test demonstrating pattern benefits
  // ============================================================================

  describe("Manual Test - Demonstrating Pattern Benefits", () => {
    it("should demonstrate the benefits of business logic testing patterns", () => {
      // Test data is consistent and reusable
      const testData = createQuarterlyMetricsFactory();

      // Function is pure and predictable
      const result1 = calculateQuarterlyMetricsSummary(testData);
      const result2 = calculateQuarterlyMetricsSummary(testData);

      // Same input always produces same output
      expect(result1).toEqual(result2);

      // Business logic is independent of UI
      expect(result1).toHaveProperty("quarter");
      expect(result1).toHaveProperty("brands");
      expect(result1).toHaveProperty("locations");
      expect(result1).toHaveProperty("activeSmartMenus");
      expect(result1).toHaveProperty("orders");
      expect(result1).toHaveProperty("ordersQoQGrowth");

      // No side effects
      expect(testData).toEqual(createQuarterlyMetricsFactory());
    });
  });
});
