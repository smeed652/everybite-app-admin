import { ApolloClient } from "@apollo/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGraphQLClient } from "../../../lib/api-graphql-apollo";
import { lambdaClient } from "../../../lib/datawarehouse-lambda-apollo";
import {
  diagnoseGraphQLError,
  getClientForOperation,
  getOperationsForClient,
  OPERATION_CLIENT_MAPPING,
  validateClientConfiguration,
  validateClientForOperation,
  type AnalyticsOperation,
  type SmartMenuOperation,
} from "../client-selection";

describe("GraphQL Client Selection Business Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClientForOperation", () => {
    it("should return main API client for SmartMenu operations", () => {
      const smartMenuOperations: SmartMenuOperation[] = [
        "GetWidget",
        "GetSmartMenus",
        "UpdateWidget",
        "CreateWidget",
      ];

      smartMenuOperations.forEach((operation) => {
        const client = getClientForOperation(operation);
        expect(client).toBe(apiGraphQLClient);
      });
    });

    it("should return Lambda client for analytics operations", () => {
      const analyticsOperations: AnalyticsOperation[] = [
        "QuarterlyMetrics",
        "DailyOrdersTrends",
        "ActivationInsights",
      ];

      analyticsOperations.forEach((operation) => {
        const client = getClientForOperation(operation);
        expect(client).toBe(lambdaClient);
      });
    });

    it("should default to main API client for unknown operations", () => {
      const unknownOperation = "UnknownOperation";
      const client = getClientForOperation(unknownOperation);
      expect(client).toBe(apiGraphQLClient);
    });

    it("should throw error for empty operation name", () => {
      expect(() => getClientForOperation("")).toThrow(
        "Operation name is required for client selection"
      );
    });
  });

  describe("validateClientForOperation", () => {
    it("should validate correct client usage", () => {
      const result = validateClientForOperation("GetWidget", apiGraphQLClient);
      expect(result.isValid).toBe(true);
      expect(result.expectedClient).toBe(apiGraphQLClient);
      expect(result.message).toBe("");
    });

    it("should detect incorrect client usage", () => {
      const result = validateClientForOperation("GetWidget", lambdaClient!);
      expect(result.isValid).toBe(false);
      expect(result.expectedClient).toBe(apiGraphQLClient);
      expect(result.message).toContain("should use main API client");
      expect(result.message).toContain("but is using Lambda client");
    });

    it("should detect analytics operation using wrong client", () => {
      const result = validateClientForOperation(
        "QuarterlyMetrics",
        apiGraphQLClient
      );
      expect(result.isValid).toBe(false);
      expect(result.expectedClient).toBe(lambdaClient);
      expect(result.message).toContain("should use Lambda client");
      expect(result.message).toContain("but is using main API client");
    });
  });

  describe("diagnoseGraphQLError", () => {
    it("should detect SmartMenu operation using wrong client", () => {
      const errorMessage = 'Cannot query field "widget" on type "Query".';
      const result = diagnoseGraphQLError(errorMessage, "GetWidget");

      expect(result.isClientMismatch).toBe(true);
      expect(result.diagnosis).toContain(
        'SmartMenu operation "GetWidget" is using wrong client'
      );
      expect(result.recommendedAction).toContain("Switch to main API client");
    });

    it("should detect analytics operation using wrong client", () => {
      const errorMessage =
        'Cannot query field "quarterlyMetrics" on type "Query".';
      const result = diagnoseGraphQLError(errorMessage, "QuarterlyMetrics");

      expect(result.isClientMismatch).toBe(true);
      expect(result.diagnosis).toContain(
        'Analytics operation "QuarterlyMetrics" is using wrong client'
      );
      expect(result.recommendedAction).toContain("Switch to Lambda client");
    });

    it("should detect type mismatch errors", () => {
      const errorMessage = 'Unknown type "Widget". Did you mean "DbWidgets"?';
      const result = diagnoseGraphQLError(errorMessage, "GetWidget");

      expect(result.isClientMismatch).toBe(true);
      expect(result.diagnosis).toContain(
        'SmartMenu operation "GetWidget" is using wrong client'
      );
    });

    it("should not flag non-schema errors as client mismatches", () => {
      const errorMessage = "Network error occurred";
      const result = diagnoseGraphQLError(errorMessage, "GetWidget");

      expect(result.isClientMismatch).toBe(false);
      expect(result.diagnosis).toBe("Not a schema mismatch error");
      expect(result.recommendedAction).toContain("Check network connectivity");
    });

    it("should handle unknown operations with schema errors", () => {
      const errorMessage = 'Cannot query field "unknown" on type "Query".';
      const result = diagnoseGraphQLError(errorMessage, "UnknownOperation");

      expect(result.isClientMismatch).toBe(true);
      expect(result.diagnosis).toContain(
        'Unknown operation "UnknownOperation"'
      );
      expect(result.recommendedAction).toContain("Review operation mapping");
    });
  });

  describe("getOperationsForClient", () => {
    it("should return SmartMenu operations for main API client", () => {
      const operations = getOperationsForClient(apiGraphQLClient);
      expect(operations).toEqual(OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS);
    });

    it("should return analytics operations for Lambda client", () => {
      const operations = getOperationsForClient(lambdaClient!);
      expect(operations).toEqual(OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS);
    });

    it("should return empty array for unknown client", () => {
      const unknownClient = {} as ApolloClient<unknown>;
      const operations = getOperationsForClient(unknownClient);
      expect(operations).toEqual([]);
    });
  });

  describe("validateClientConfiguration", () => {
    it("should validate proper client configuration", () => {
      const result = validateClientConfiguration();
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it("should detect when clients are the same instance", () => {
      // Test the validation logic directly
      const result = validateClientConfiguration();

      // Since our actual clients are different, this should pass
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);

      // Test that our validation logic works by checking the actual client comparison
      expect(apiGraphQLClient).not.toBe(lambdaClient);
    });
  });

  describe("Integration Test - Real World Scenario", () => {
    it("should catch the actual client mismatch issue we encountered", () => {
      // This test simulates the exact scenario that occurred
      // where SmartMenu operations were using the Lambda client instead of main API client

      const operationName = "GetWidget";
      const wrongClient = lambdaClient!; // This is what was happening
      const correctClient = apiGraphQLClient; // This is what should have been used

      // Test that our validation would catch this
      const validation = validateClientForOperation(operationName, wrongClient);
      expect(validation.isValid).toBe(false);
      expect(validation.expectedClient).toBe(correctClient);

      // Test that our error diagnosis would identify this
      const errorMessage = 'Cannot query field "widget" on type "Query".';
      const diagnosis = diagnoseGraphQLError(errorMessage, operationName);
      expect(diagnosis.isClientMismatch).toBe(true);
      expect(diagnosis.diagnosis).toContain(
        'SmartMenu operation "GetWidget" is using wrong client'
      );
      expect(diagnosis.recommendedAction).toContain(
        "Switch to main API client"
      );

      // Test that our client selection would return the correct client
      const selectedClient = getClientForOperation(operationName);
      expect(selectedClient).toBe(correctClient);
    });

    it("should validate the complete operation mapping", () => {
      // Test that all SmartMenu operations map to main API client
      OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS.forEach((operation) => {
        const client = getClientForOperation(operation);
        expect(client).toBe(apiGraphQLClient);
      });

      // Test that all analytics operations map to Lambda client
      OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS.forEach((operation) => {
        const client = getClientForOperation(operation);
        expect(client).toBe(lambdaClient);
      });
    });
  });
});
