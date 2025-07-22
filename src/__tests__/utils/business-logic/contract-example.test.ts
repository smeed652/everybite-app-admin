import { describe, expect, it, vi } from "vitest";
import {
  createContractTestSuite,
  createContractValidator,
  createDashboardMetricsFactory,
  createQuarterlyMetricsFactory,
  testApiResponseContracts,
  testDataTransformationContracts,
  testHookBusinessLogicContracts,
  testHookDataTransformationContracts,
  testServiceContracts,
  testServiceMethodSignatures,
} from "./index";

// ============================================================================
// EXAMPLE SERVICE AND HOOK IMPLEMENTATIONS
// ============================================================================

/**
 * Example service interface
 */
interface ExampleService {
  getQuarterlyMetrics(): Promise<any>;
  getDashboardMetrics(): Promise<any>;
  updateWidget(id: string, data: any): Promise<any>;
}

/**
 * Example service implementation
 */
class ExampleServiceImplementation implements ExampleService {
  async getQuarterlyMetrics(): Promise<any> {
    return createQuarterlyMetricsFactory();
  }

  async getDashboardMetrics(): Promise<any> {
    return createDashboardMetricsFactory();
  }

  async updateWidget(id: string, data: any): Promise<any> {
    if (!id) {
      throw new Error("Widget ID is required");
    }
    return { id, ...data, updatedAt: new Date().toISOString() };
  }
}

/**
 * Example hook interface
 */
interface ExampleHook {
  data: any;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  update: (data: any) => void;
}

/**
 * Example hook implementation
 */
function createExampleHook(): ExampleHook {
  return {
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    update: vi.fn(),
  };
}

// ============================================================================
// EXAMPLE CONTRACT TESTS
// ============================================================================

describe("Contract Testing Patterns - Example Usage", () => {
  // ============================================================================
  // EXAMPLE 1: Service Contract Testing
  // ============================================================================

  describe("ExampleService - Service Contract Tests", () => {
    testServiceContracts(
      "ExampleService",
      () => new ExampleServiceImplementation(),
      [
        {
          method: "getQuarterlyMetrics",
          input: undefined,
          expectedOutput: createQuarterlyMetricsFactory(),
          description: "should return quarterly metrics data",
        },
        {
          method: "getDashboardMetrics",
          input: undefined,
          expectedOutput: createDashboardMetricsFactory(),
          description: "should return dashboard metrics data",
        },
        {
          method: "updateWidget",
          input: ["widget_1", { name: "Updated Widget" }],
          expectedOutput: {
            id: "widget_1",
            name: "Updated Widget",
            updatedAt: expect.any(String),
          },
          description: "should update widget successfully",
        },
        {
          method: "updateWidget",
          input: ["", { name: "Invalid Widget" }],
          expectedOutput: null,
          expectedError: "Widget ID is required",
          description: "should throw error for empty ID",
        },
      ]
    );

    testServiceMethodSignatures(
      "ExampleService",
      () => new ExampleServiceImplementation(),
      [
        {
          method: "getQuarterlyMetrics",
          expectedParams: 0,
          expectedReturnType: "promise",
        },
        {
          method: "getDashboardMetrics",
          expectedParams: 0,
          expectedReturnType: "promise",
        },
        {
          method: "updateWidget",
          expectedParams: 2,
          expectedReturnType: "promise",
        },
      ]
    );
  });

  // ============================================================================
  // EXAMPLE 2: Hook Contract Testing
  // ============================================================================

  describe("ExampleHook - Hook Contract Tests", () => {
    testHookBusinessLogicContracts("ExampleHook", createExampleHook, [
      {
        input: undefined,
        expectedState: {
          data: null,
          loading: false,
          error: null,
        },
        expectedActions: ["refresh", "update"],
        description: "should have correct initial state and actions",
      },
    ]);

    testHookDataTransformationContracts("ExampleHook", createExampleHook, [
      {
        input: createQuarterlyMetricsFactory(),
        expectedTransformation: (hook) => {
          hook.update(createQuarterlyMetricsFactory());
          expect(hook.update).toHaveBeenCalledWith(
            createQuarterlyMetricsFactory()
          );
        },
        description: "should transform quarterly metrics data",
      },
    ]);
  });

  // ============================================================================
  // EXAMPLE 3: API Response Contract Testing
  // ============================================================================

  describe("API Response Contract Tests", () => {
    testApiResponseContracts(
      "QuarterlyMetricsAPI",
      async () => createQuarterlyMetricsFactory(),
      [
        {
          expectedStructure: {
            quarterLabel: expect.any(String),
            brands: expect.objectContaining({
              count: expect.any(Number),
              qoqGrowthPercent: expect.any(Number),
            }),
            locations: expect.objectContaining({
              count: expect.any(Number),
              qoqGrowthPercent: expect.any(Number),
            }),
            activeSmartMenus: expect.objectContaining({
              count: expect.any(Number),
              qoqGrowthPercent: expect.any(Number),
            }),
            orders: expect.objectContaining({
              count: expect.any(Number),
              qoqGrowthPercent: expect.any(Number),
            }),
          },
          expectedTypes: {
            quarterLabel: "string",
            brands: "object",
            locations: "object",
            activeSmartMenus: "object",
            orders: "object",
          },
          validationRules: [
            (response) => {
              expect(response.brands.count).toBeGreaterThanOrEqual(0);
              expect(response.locations.count).toBeGreaterThanOrEqual(0);
              expect(response.activeSmartMenus.count).toBeGreaterThanOrEqual(0);
              expect(response.orders.count).toBeGreaterThanOrEqual(0);
            },
          ],
          description: "should maintain quarterly metrics response contract",
        },
      ]
    );
  });

  // ============================================================================
  // EXAMPLE 4: Data Transformation Contract Testing
  // ============================================================================

  describe("Data Transformation Contract Tests", () => {
    const transformQuarterlyData = (data: any) => ({
      quarter: data.quarterLabel || "Unknown Quarter",
      brands: data.brands?.count || 0,
      locations: data.locations?.count || 0,
      activeSmartMenus: data.activeSmartMenus?.count || 0,
      orders: data.orders?.count || 0,
      ordersQoQGrowth: data.orders?.qoqGrowthPercent || 0,
    });

    testDataTransformationContracts(
      "transformQuarterlyData",
      transformQuarterlyData,
      [
        {
          input: createQuarterlyMetricsFactory(),
          expectedOutput: {
            quarter: "Q3 2025",
            brands: 5,
            locations: 28,
            activeSmartMenus: 3,
            orders: 100,
            ordersQoQGrowth: 25.0,
          },
          expectedStructure: {
            quarter: expect.any(String),
            brands: expect.any(Number),
            locations: expect.any(Number),
            activeSmartMenus: expect.any(Number),
            orders: expect.any(Number),
            ordersQoQGrowth: expect.any(Number),
          },
          invariants: [
            (input, output) => {
              // Invariant: output should have all required fields
              expect(output).toHaveProperty("quarter");
              expect(output).toHaveProperty("brands");
              expect(output).toHaveProperty("locations");
              expect(output).toHaveProperty("activeSmartMenus");
              expect(output).toHaveProperty("orders");
              expect(output).toHaveProperty("ordersQoQGrowth");
            },
            (input, output) => {
              // Invariant: numeric values should be non-negative
              expect(output.brands).toBeGreaterThanOrEqual(0);
              expect(output.locations).toBeGreaterThanOrEqual(0);
              expect(output.activeSmartMenus).toBeGreaterThanOrEqual(0);
              expect(output.orders).toBeGreaterThanOrEqual(0);
            },
          ],
          description: "should transform quarterly data correctly",
        },
      ]
    );
  });

  // ============================================================================
  // EXAMPLE 5: Contract Validator Usage
  // ============================================================================

  describe("Contract Validator Usage", () => {
    it("should validate quarterly metrics contract", () => {
      const quarterlyMetricsValidator = createContractValidator({
        required: [
          "quarterLabel",
          "brands",
          "locations",
          "activeSmartMenus",
          "orders",
        ],
        types: {
          quarterLabel: "string",
          brands: "object",
          locations: "object",
          activeSmartMenus: "object",
          orders: "object",
        },
        validations: [
          (data) => {
            expect(data.brands).toHaveProperty("count");
            expect(data.brands).toHaveProperty("qoqGrowthPercent");
            expect(data.locations).toHaveProperty("count");
            expect(data.locations).toHaveProperty("qoqGrowthPercent");
            expect(data.activeSmartMenus).toHaveProperty("count");
            expect(data.activeSmartMenus).toHaveProperty("qoqGrowthPercent");
            expect(data.orders).toHaveProperty("count");
            expect(data.orders).toHaveProperty("qoqGrowthPercent");
          },
        ],
      });

      const testData = createQuarterlyMetricsFactory();
      quarterlyMetricsValidator(testData);
    });
  });

  // ============================================================================
  // EXAMPLE 6: Comprehensive Contract Test Suite
  // ============================================================================

  describe("Comprehensive Contract Test Suite", () => {
    createContractTestSuite({
      serviceName: "ExampleService",
      serviceFactory: () => new ExampleServiceImplementation(),
      hookName: "ExampleHook",
      hookFactory: createExampleHook,
      serviceContracts: [
        {
          method: "getQuarterlyMetrics",
          input: undefined,
          expectedOutput: createQuarterlyMetricsFactory(),
          description: "should return quarterly metrics",
        },
      ],
      serviceMethodSignatures: [
        {
          method: "getQuarterlyMetrics",
          expectedParams: 0,
          expectedReturnType: "promise",
        },
      ],
      hookContracts: [
        {
          input: undefined,
          expectedState: {
            data: null,
            loading: false,
            error: null,
          },
          expectedActions: ["refresh", "update"],
        },
      ],
      hookTransformations: [
        {
          input: createQuarterlyMetricsFactory(),
          expectedTransformation: (hook) => {
            hook.update(createQuarterlyMetricsFactory());
            expect(hook.update).toHaveBeenCalled();
          },
        },
      ],
    });
  });
});
