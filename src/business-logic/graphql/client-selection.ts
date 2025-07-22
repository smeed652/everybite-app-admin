import { ApolloClient } from "@apollo/client";
import { apiGraphQLClient } from "../../lib/api-graphql-apollo";
import { lambdaClient } from "../../lib/datawarehouse-lambda-apollo";

// Business logic: Define which operations belong to which API
export const OPERATION_CLIENT_MAPPING = {
  // SmartMenu operations - use main API
  SMARTMENU_OPERATIONS: [
    "GetWidget",
    "GetSmartMenus",
    "UpdateWidget",
    "CreateWidget",
    "DeleteWidget",
    "PublishWidget",
    "UnpublishWidget",
  ],

  // Analytics operations - use Lambda API
  ANALYTICS_OPERATIONS: [
    "QuarterlyMetrics",
    "DailyOrdersTrends",
    "ActivationInsights",
    "WidgetAnalytics",
    "DailyInteractions",
    "MetabaseUsers",
  ],
} as const;

export type SmartMenuOperation =
  (typeof OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS)[number];
export type AnalyticsOperation =
  (typeof OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS)[number];
export type GraphQLOperation = SmartMenuOperation | AnalyticsOperation;

/**
 * Business logic function to determine which GraphQL client to use for a given operation
 * This centralizes the client selection logic and prevents mismatches
 */
export function getClientForOperation(
  operationName: string
): ApolloClient<unknown> {
  // Validate that we have a valid operation name
  if (!operationName) {
    throw new Error("Operation name is required for client selection");
  }

  // Check if it's a SmartMenu operation
  if (
    OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS.includes(
      operationName as SmartMenuOperation
    )
  ) {
    return apiGraphQLClient;
  }

  // Check if it's an analytics operation
  if (
    OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS.includes(
      operationName as AnalyticsOperation
    )
  ) {
    if (!lambdaClient) {
      throw new Error(
        `Lambda client not available for analytics operation: ${operationName}`
      );
    }
    return lambdaClient;
  }

  // Default to main API client for unknown operations
  console.warn(
    `Unknown operation "${operationName}" - defaulting to main API client`
  );
  return apiGraphQLClient;
}

/**
 * Business logic function to validate that an operation is using the correct client
 * This would catch client mismatch issues early
 */
export function validateClientForOperation(
  operationName: string,
  client: ApolloClient<unknown>
): {
  isValid: boolean;
  expectedClient: ApolloClient<unknown>;
  message: string;
} {
  const expectedClient = getClientForOperation(operationName);
  const isValid = client === expectedClient;

  let message = "";
  if (!isValid) {
    const expectedClientType =
      expectedClient === apiGraphQLClient ? "main API" : "Lambda";
    const actualClientType =
      client === apiGraphQLClient ? "main API" : "Lambda";
    message = `Operation "${operationName}" should use ${expectedClientType} client, but is using ${actualClientType} client`;
  }

  return { isValid, expectedClient, message };
}

/**
 * Business logic function to detect and diagnose GraphQL schema errors
 * This helps identify client configuration issues from error messages
 */
export function diagnoseGraphQLError(
  errorMessage: string,
  operationName: string
): { isClientMismatch: boolean; diagnosis: string; recommendedAction: string } {
  // Check for schema mismatch patterns
  const schemaMismatchPatterns = [
    /Cannot query field "(\w+)" on type "(\w+)"/,
    /Unknown type "(\w+)"/,
    /Field "(\w+)" of type "(\w+)" must have a selection of subfields/,
  ];

  const isSchemaMismatch = schemaMismatchPatterns.some((pattern) =>
    pattern.test(errorMessage)
  );

  if (!isSchemaMismatch) {
    return {
      isClientMismatch: false,
      diagnosis: "Not a schema mismatch error",
      recommendedAction: "Check network connectivity and API availability",
    };
  }

  // Check if this operation should be using a different client
  const smartMenuOperations = OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS;
  const analyticsOperations = OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS;

  if (smartMenuOperations.includes(operationName as SmartMenuOperation)) {
    return {
      isClientMismatch: true,
      diagnosis: `SmartMenu operation "${operationName}" is using wrong client`,
      recommendedAction: "Switch to main API client (apiGraphQLClient)",
    };
  }

  if (analyticsOperations.includes(operationName as AnalyticsOperation)) {
    return {
      isClientMismatch: true,
      diagnosis: `Analytics operation "${operationName}" is using wrong client`,
      recommendedAction: "Switch to Lambda client (lambdaClient)",
    };
  }

  return {
    isClientMismatch: true,
    diagnosis: `Unknown operation "${operationName}" with schema mismatch`,
    recommendedAction: "Review operation mapping and client configuration",
  };
}

/**
 * Business logic function to get all operations for a specific client type
 * Useful for testing and validation
 */
export function getOperationsForClient(
  client: ApolloClient<unknown>
): GraphQLOperation[] {
  if (client === apiGraphQLClient) {
    return [...OPERATION_CLIENT_MAPPING.SMARTMENU_OPERATIONS];
  }

  if (client === lambdaClient) {
    return [...OPERATION_CLIENT_MAPPING.ANALYTICS_OPERATIONS];
  }

  return [];
}

/**
 * Business logic function to validate the entire client configuration
 * This ensures all clients are properly configured
 */
export function validateClientConfiguration(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check that main API client is configured
  if (!apiGraphQLClient) {
    issues.push("Main API client (apiGraphQLClient) is not configured");
    recommendations.push("Ensure apiGraphQLClient is properly initialized");
  }

  // Check that Lambda client is configured
  if (!lambdaClient) {
    issues.push("Lambda client (lambdaClient) is not configured");
    recommendations.push("Ensure lambdaClient is properly initialized");
  }

  // Check that clients are different
  if (apiGraphQLClient === lambdaClient) {
    issues.push("Main API client and Lambda client are the same instance");
    recommendations.push("Ensure separate client instances for different APIs");
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}
