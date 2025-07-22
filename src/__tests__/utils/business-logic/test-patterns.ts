import { describe, expect, it } from "vitest";

/**
 * Business Logic Testing Patterns
 *
 * This file defines patterns and utilities for testing pure business logic functions.
 * These patterns ensure that business logic tests are:
 * - Independent of UI components
 * - Fast and reliable
 * - Easy to understand and maintain
 * - Focused on business rules and data transformation
 */

// ============================================================================
// PATTERN 1: Pure Function Testing
// ============================================================================

/**
 * Test pattern for pure functions that transform data
 *
 * @param functionName - Name of the function being tested
 * @param testFunction - The function to test
 * @param testCases - Array of test cases with input and expected output
 */
export function testPureFunction<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  testCases: Array<{
    name: string;
    input: TInput;
    expected: TOutput;
    description?: string;
  }>
) {
  describe(`${functionName} - Pure Function Tests`, () => {
    testCases.forEach(({ name, input, expected, description }) => {
      it(`should ${name}`, () => {
        const result = testFunction(input);
        expect(result).toEqual(expected);
      });

      if (description) {
        it(`should ${name} - ${description}`, () => {
          const result = testFunction(input);
          expect(result).toEqual(expected);
        });
      }
    });
  });
}

// ============================================================================
// PATTERN 2: Edge Case Testing
// ============================================================================

/**
 * Test pattern for edge cases and error conditions
 *
 * @param functionName - Name of the function being tested
 * @param testFunction - The function to test
 * @param edgeCases - Array of edge cases with input and expected behavior
 */
export function testEdgeCases<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  edgeCases: Array<{
    name: string;
    input: TInput;
    expected: TOutput | Error;
    shouldThrow?: boolean;
  }>
) {
  describe(`${functionName} - Edge Cases`, () => {
    edgeCases.forEach(({ name, input, expected, shouldThrow }) => {
      it(`should handle ${name}`, () => {
        if (shouldThrow) {
          expect(() => testFunction(input)).toThrow(expected as Error);
        } else {
          const result = testFunction(input);
          expect(result).toEqual(expected);
        }
      });
    });
  });
}

// ============================================================================
// PATTERN 3: Data Transformation Testing
// ============================================================================

/**
 * Test pattern for data transformation functions
 *
 * @param functionName - Name of the function being tested
 * @param testFunction - The function to test
 * @param transformations - Array of transformation test cases
 */
export function testDataTransformation<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  transformations: Array<{
    name: string;
    input: TInput;
    expected: TOutput;
    validation?: (result: TOutput) => void;
  }>
) {
  describe(`${functionName} - Data Transformation Tests`, () => {
    transformations.forEach(({ name, input, expected, validation }) => {
      it(`should transform ${name}`, () => {
        const result = testFunction(input);
        expect(result).toEqual(expected);

        if (validation) {
          validation(result);
        }
      });
    });
  });
}

// ============================================================================
// PATTERN 4: Business Rule Testing
// ============================================================================

/**
 * Test pattern for business rule validation
 *
 * @param functionName - Name of the function being tested
 * @param testFunction - The function to test
 * @param businessRules - Array of business rule test cases
 */
export function testBusinessRules<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  businessRules: Array<{
    rule: string;
    input: TInput;
    expected: TOutput;
    description?: string;
  }>
) {
  describe(`${functionName} - Business Rules`, () => {
    businessRules.forEach(({ rule, input, expected, description }) => {
      it(`should follow business rule: ${rule}`, () => {
        const result = testFunction(input);
        expect(result).toEqual(expected);
      });

      if (description) {
        it(`should follow business rule: ${rule} - ${description}`, () => {
          const result = testFunction(input);
          expect(result).toEqual(expected);
        });
      }
    });
  });
}

// ============================================================================
// PATTERN 5: Performance Testing for Business Logic
// ============================================================================

/**
 * Test pattern for performance-critical business logic
 *
 * @param functionName - Name of the function being tested
 * @param testFunction - The function to test
 * @param performanceTests - Array of performance test cases
 */
export function testPerformance<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  performanceTests: Array<{
    name: string;
    input: TInput;
    maxExecutionTime: number; // in milliseconds
  }>
) {
  describe(`${functionName} - Performance Tests`, () => {
    performanceTests.forEach(({ name, input, maxExecutionTime }) => {
      it(`should complete ${name} within ${maxExecutionTime}ms`, () => {
        const startTime = performance.now();
        testFunction(input);
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        expect(executionTime).toBeLessThan(maxExecutionTime);
      });
    });
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a test data factory for consistent test data
 */
export function createTestDataFactory<T>(defaultData: T) {
  return (overrides: Partial<T> = {}): T => ({
    ...defaultData,
    ...overrides,
  });
}

/**
 * Create a test data builder for complex test data
 */
export function createTestDataBuilder<T>(defaultData: T) {
  return {
    with: (overrides: Partial<T>) =>
      createTestDataBuilder({ ...defaultData, ...overrides }),
    build: () => defaultData,
  };
}

/**
 * Validate that a function is pure (same input always produces same output)
 */
export function validatePureFunction<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  testInput: TInput,
  iterations: number = 3
) {
  describe(`${functionName} - Pure Function Validation`, () => {
    it("should produce consistent output for same input", () => {
      const results: TOutput[] = [];

      for (let i = 0; i < iterations; i++) {
        results.push(testFunction(testInput));
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result, _index) => {
        expect(result).toEqual(firstResult);
      });
    });
  });
}

/**
 * Test that a function handles null/undefined inputs gracefully
 */
export function testNullHandling<TInput, TOutput>(
  functionName: string,
  testFunction: (input: TInput) => TOutput,
  nullCases: Array<{
    name: string;
    input: TInput | null | undefined;
    expected: TOutput | Error;
    shouldThrow?: boolean;
  }>
) {
  describe(`${functionName} - Null/Undefined Handling`, () => {
    nullCases.forEach(({ name, input, expected, shouldThrow }) => {
      it(`should handle ${name}`, () => {
        if (shouldThrow) {
          expect(() => testFunction(input as TInput)).toThrow(
            expected as Error
          );
        } else {
          const result = testFunction(input as TInput);
          expect(result).toEqual(expected);
        }
      });
    });
  });
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Helper to create a comprehensive test suite for a business logic function
 */
export function createBusinessLogicTestSuite<TInput, TOutput>(config: {
  functionName: string;
  testFunction: (input: TInput) => TOutput;
  pureFunctionTests?: Array<{
    name: string;
    input: TInput;
    expected: TOutput;
    description?: string;
  }>;
  edgeCases?: Array<{
    name: string;
    input: TInput;
    expected: TOutput | Error;
    shouldThrow?: boolean;
  }>;
  transformations?: Array<{
    name: string;
    input: TInput;
    expected: TOutput;
    validation?: (result: TOutput) => void;
  }>;
  businessRules?: Array<{
    rule: string;
    input: TInput;
    expected: TOutput;
    description?: string;
  }>;
  performanceTests?: Array<{
    name: string;
    input: TInput;
    maxExecutionTime: number;
  }>;
  nullHandling?: Array<{
    name: string;
    input: TInput | null | undefined;
    expected: TOutput | Error;
    shouldThrow?: boolean;
  }>;
}) {
  const {
    functionName,
    testFunction,
    pureFunctionTests,
    edgeCases,
    transformations,
    businessRules,
    performanceTests,
    nullHandling,
  } = config;

  describe(`${functionName} - Business Logic Test Suite`, () => {
    if (pureFunctionTests) {
      testPureFunction(functionName, testFunction, pureFunctionTests);
    }

    if (edgeCases) {
      testEdgeCases(functionName, testFunction, edgeCases);
    }

    if (transformations) {
      testDataTransformation(functionName, testFunction, transformations);
    }

    if (businessRules) {
      testBusinessRules(functionName, testFunction, businessRules);
    }

    if (performanceTests) {
      testPerformance(functionName, testFunction, performanceTests);
    }

    if (nullHandling) {
      testNullHandling(functionName, testFunction, nullHandling);
    }
  });
}
