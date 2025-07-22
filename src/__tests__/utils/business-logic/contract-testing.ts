import { beforeEach, describe, expect, it } from "vitest";

/**
 * Contract Testing Patterns
 *
 * This file defines patterns for testing contracts between different layers:
 * - Service layer contracts
 * - Hook business logic contracts
 * - API response contracts
 * - Data transformation contracts
 */

// ============================================================================
// SERVICE LAYER CONTRACT TESTING
// ============================================================================

/**
 * Test pattern for service layer contracts
 *
 * @param serviceName - Name of the service being tested
 * @param serviceFactory - Function to create service instance
 * @param contracts - Array of contract test cases
 */
export function testServiceContracts<TService>(
  serviceName: string,
  serviceFactory: () => TService,
  contracts: Array<{
    method: keyof TService;
    input: unknown;
    expectedOutput: unknown;
    expectedError?: string;
    timeout?: number;
    description?: string;
  }>
) {
  describe(`${serviceName} - Service Contracts`, () => {
    let service: TService;

    beforeEach(() => {
      service = serviceFactory();
    });

    contracts.forEach(
      ({
        method,
        input,
        expectedOutput,
        expectedError,
        timeout,
        description,
      }) => {
        const testName =
          description || `should maintain contract for ${String(method)}`;

        it(
          testName,
          async () => {
            const methodFn = service[method] as (...args: unknown[]) => unknown;

            if (expectedError) {
              // Handle both sync and async errors
              const result = methodFn.call(
                service,
                ...(Array.isArray(input) ? input : [input])
              );

              // If it's a promise, wait for it to reject
              if (result instanceof Promise) {
                await expect(result).rejects.toThrow(expectedError);
              } else {
                // For sync methods, the error should have been thrown already
                // This case is rare for async methods, but we handle it
                expect(result).toBeUndefined();
              }
            } else {
              const result = await methodFn.call(
                service,
                ...(Array.isArray(input) ? input : [input])
              );
              expect(result).toEqual(expectedOutput);
            }
          },
          timeout || 5000
        );
      }
    );
  });
}

/**
 * Test pattern for service method signatures
 *
 * @param serviceName - Name of the service being tested
 * @param serviceFactory - Function to create service instance
 * @param methods - Array of method signatures to validate
 */
export function testServiceMethodSignatures<TService>(
  serviceName: string,
  serviceFactory: () => TService,
  methods: Array<{
    method: keyof TService;
    expectedParams: number;
    expectedReturnType: "promise" | "sync" | "any";
  }>
) {
  describe(`${serviceName} - Method Signatures`, () => {
    let service: TService;

    beforeEach(() => {
      service = serviceFactory();
    });

    methods.forEach(({ method, expectedParams, expectedReturnType }) => {
      it(`should have correct signature for ${String(method)}`, () => {
        const methodFn = service[method] as (...args: unknown[]) => unknown;

        // Check if method exists
        expect(typeof methodFn).toBe("function");

        // Check parameter count
        expect(methodFn.length).toBe(expectedParams);

        // Check return type
        if (expectedReturnType === "promise") {
          // For methods that require parameters, we need to provide dummy values
          // to avoid execution errors during signature checking
          const dummyArgs = Array(expectedParams).fill("dummy");
          const result = methodFn.call(service, ...dummyArgs);
          expect(result).toBeInstanceOf(Promise);
        }
      });
    });
  });
}

// ============================================================================
// HOOK BUSINESS LOGIC CONTRACT TESTING
// ============================================================================

/**
 * Test pattern for hook business logic contracts
 *
 * @param hookName - Name of the hook being tested
 * @param hookFactory - Function to create hook instance
 * @param contracts - Array of contract test cases
 */
export function testHookBusinessLogicContracts<THook>(
  hookName: string,
  hookFactory: () => THook,
  contracts: Array<{
    input: unknown;
    expectedState: unknown;
    expectedActions: string[];
    description?: string;
  }>
) {
  describe(`${hookName} - Business Logic Contracts`, () => {
    contracts.forEach(
      ({ input, expectedState, expectedActions, description }) => {
        const testName =
          description || `should maintain business logic contract`;

        it(testName, () => {
          const hook = hookFactory();

          // Test state contract
          if (expectedState) {
            expect(hook).toMatchObject(expectedState);
          }

          // Test action contract
          if (expectedActions) {
            expectedActions.forEach((action) => {
              expect(hook).toHaveProperty(action);
              expect(typeof (hook as any)[action]).toBe("function");
            });
          }
        });
      }
    );
  });
}

/**
 * Test pattern for hook data transformation contracts
 *
 * @param hookName - Name of the hook being tested
 * @param hookFactory - Function to create hook instance
 * @param transformations - Array of transformation test cases
 */
export function testHookDataTransformationContracts<THook>(
  hookName: string,
  hookFactory: () => THook,
  transformations: Array<{
    input: unknown;
    expectedTransformation: (hook: THook) => void;
    description?: string;
  }>
) {
  describe(`${hookName} - Data Transformation Contracts`, () => {
    transformations.forEach(
      ({ input, expectedTransformation, description }) => {
        const testName = description || `should transform data correctly`;

        it(testName, () => {
          const hook = hookFactory();
          expectedTransformation(hook);
        });
      }
    );
  });
}

// ============================================================================
// API RESPONSE CONTRACT TESTING
// ============================================================================

/**
 * Test pattern for API response contracts
 *
 * @param apiName - Name of the API being tested
 * @param apiCall - Function that makes the API call
 * @param contracts - Array of contract test cases
 */
export function testApiResponseContracts<TResponse>(
  apiName: string,
  apiCall: () => Promise<TResponse>,
  contracts: Array<{
    expectedStructure: Record<string, unknown>;
    expectedTypes: Record<string, string>;
    validationRules?: Array<(response: TResponse) => void>;
    description?: string;
  }>
) {
  describe(`${apiName} - API Response Contracts`, () => {
    contracts.forEach(
      ({ expectedStructure, expectedTypes, validationRules, description }) => {
        const testName = description || `should maintain response contract`;

        it(testName, async () => {
          const response = await apiCall();

          // Test structure contract
          if (expectedStructure) {
            expect(response).toMatchObject(expectedStructure);
          }

          // Test type contract
          if (expectedTypes) {
            Object.entries(expectedTypes).forEach(([key, expectedType]) => {
              const value = (response as any)[key];
              switch (expectedType) {
                case "string":
                  expect(typeof value).toBe("string");
                  break;
                case "number":
                  expect(typeof value).toBe("number");
                  break;
                case "boolean":
                  expect(typeof value).toBe("boolean");
                  break;
                case "array":
                  expect(Array.isArray(value)).toBe(true);
                  break;
                case "object":
                  expect(typeof value).toBe("object");
                  expect(value).not.toBeNull();
                  break;
                default:
                  expect(typeof value).toBe(expectedType);
              }
            });
          }

          // Test validation rules
          if (validationRules) {
            validationRules.forEach((rule) => {
              rule(response);
            });
          }
        });
      }
    );
  });
}

// ============================================================================
// DATA TRANSFORMATION CONTRACT TESTING
// ============================================================================

/**
 * Test pattern for data transformation contracts
 *
 * @param transformationName - Name of the transformation being tested
 * @param transformationFn - The transformation function
 * @param contracts - Array of contract test cases
 */
export function testDataTransformationContracts<TInput, TOutput>(
  transformationName: string,
  transformationFn: (input: TInput) => TOutput,
  contracts: Array<{
    input: TInput;
    expectedOutput: TOutput;
    expectedStructure: Record<string, unknown>;
    invariants?: Array<(input: TInput, output: TOutput) => void>;
    description?: string;
  }>
) {
  describe(`${transformationName} - Data Transformation Contracts`, () => {
    contracts.forEach(
      ({
        input,
        expectedOutput,
        expectedStructure,
        invariants,
        description,
      }) => {
        const testName =
          description || `should maintain transformation contract`;

        it(testName, () => {
          const result = transformationFn(input);

          // Test output contract
          if (expectedOutput) {
            expect(result).toEqual(expectedOutput);
          }

          // Test structure contract
          if (expectedStructure) {
            expect(result).toMatchObject(expectedStructure);
          }

          // Test invariants
          if (invariants) {
            invariants.forEach((invariant) => {
              invariant(input, result);
            });
          }
        });
      }
    );
  });
}

// ============================================================================
// CONTRACT VALIDATION UTILITIES
// ============================================================================

/**
 * Create a contract validator for consistent validation
 */
export function createContractValidator<T>(contract: {
  required: (keyof T)[];
  optional?: (keyof T)[];
  types: Record<keyof T, string>;
  validations?: Array<(data: T) => void>;
}) {
  return (data: T) => {
    // Check required fields
    contract.required.forEach((field) => {
      expect(data).toHaveProperty(String(field));
      expect((data as any)[field]).not.toBeUndefined();
    });

    // Check types
    Object.entries(contract.types).forEach(([key, expectedType]) => {
      if ((data as any)[key] !== undefined) {
        const value = (data as any)[key];
        switch (expectedType) {
          case "string":
            expect(typeof value).toBe("string");
            break;
          case "number":
            expect(typeof value).toBe("number");
            break;
          case "boolean":
            expect(typeof value).toBe("boolean");
            break;
          case "array":
            expect(Array.isArray(value)).toBe(true);
            break;
          case "object":
            expect(typeof value).toBe("object");
            expect(value).not.toBeNull();
            break;
          default:
            expect(typeof value).toBe(expectedType);
        }
      }
    });

    // Run custom validations
    if (contract.validations) {
      contract.validations.forEach((validation) => {
        validation(data);
      });
    }
  };
}

/**
 * Create a comprehensive contract test suite
 */
export function createContractTestSuite<TService, THook>(config: {
  serviceName: string;
  serviceFactory: () => TService;
  hookName: string;
  hookFactory: () => THook;
  serviceContracts?: Array<{
    method: keyof TService;
    input: unknown;
    expectedOutput: unknown;
    expectedError?: string;
    timeout?: number;
    description?: string;
  }>;
  serviceMethodSignatures?: Array<{
    method: keyof TService;
    expectedParams: number;
    expectedReturnType: "promise" | "sync" | "any";
  }>;
  hookContracts?: Array<{
    input: unknown;
    expectedState: unknown;
    expectedActions: string[];
    description?: string;
  }>;
  hookTransformations?: Array<{
    input: unknown;
    expectedTransformation: (hook: THook) => void;
    description?: string;
  }>;
}) {
  const {
    serviceName,
    serviceFactory,
    hookName,
    hookFactory,
    serviceContracts,
    serviceMethodSignatures,
    hookContracts,
    hookTransformations,
  } = config;

  describe(`${serviceName} & ${hookName} - Contract Test Suite`, () => {
    if (serviceContracts) {
      testServiceContracts(serviceName, serviceFactory, serviceContracts);
    }

    if (serviceMethodSignatures) {
      testServiceMethodSignatures(
        serviceName,
        serviceFactory,
        serviceMethodSignatures
      );
    }

    if (hookContracts) {
      testHookBusinessLogicContracts(hookName, hookFactory, hookContracts);
    }

    if (hookTransformations) {
      testHookDataTransformationContracts(
        hookName,
        hookFactory,
        hookTransformations
      );
    }
  });
}
