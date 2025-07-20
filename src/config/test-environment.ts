// Test Environment Configuration
// This file contains production API keys and settings for testing against real APIs

export const testEnvironmentConfig = {
  // GraphQL API Configuration
  graphqlUri: "https://api.everybite.com/graphql",
  apiKey: "3SB3ZawcNr3AT11vxKruJ",

  // AWS Configuration (Production)
  awsRegion: "us-west-1",
  cognitoUserPoolId: "us-west-1_HuVwywmH1",
  cognitoAppClientId: "746d7c6ituu4n572hef100m5s7",

  // Lambda GraphQL API Configuration
  lambdaGraphqlUri: "https://api.everybite.com/graphql",
  lambdaApiKey: "3SB3ZawcNr3AT11vxKruJ",

  // Metabase Configuration (Production)
  metabaseUrl: "https://analytics.everybite.com",
  metabaseUsername: "sid@everybite.com",
  metabasePassword: "wH3R4f?Lbot5Ir",

  // Test Configuration
  logLevel: "debug",
  enableCaching: true,
  enableDebug: true,

  // Test User Credentials
  testUsername: "cypress-test@example.com",
  testPassword: "Test123!",

  // API Timeouts for Testing
  apiTimeout: 10000,
  lambdaTimeout: 15000,

  // Test Environment Flags
  testMode: true,
  enableTestLogging: true,
};

// Helper function to get environment variable with fallback
export const getTestEnvVar = (key: string, fallback: string = ""): string => {
  // First try to get from import.meta.env (Vite)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const value = import.meta.env[key];
    if (value) return value;
  }

  // Then try to get from process.env (Node.js)
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value) return value;
  }

  // Finally, fall back to test config
  const configKey = key.replace("VITE_", "").toLowerCase();
  return (testEnvironmentConfig as any)[configKey] || fallback;
};

// Test environment setup function
export const setupTestEnvironment = () => {
  // Set up environment variables for testing
  if (typeof process !== "undefined" && process.env) {
    process.env.VITE_GRAPHQL_URI = testEnvironmentConfig.graphqlUri;
    process.env.VITE_API_KEY = testEnvironmentConfig.apiKey;
    process.env.VITE_AWS_REGION = testEnvironmentConfig.awsRegion;
    process.env.VITE_COGNITO_USER_POOL_ID =
      testEnvironmentConfig.cognitoUserPoolId;
    process.env.VITE_COGNITO_APP_CLIENT_ID =
      testEnvironmentConfig.cognitoAppClientId;
    process.env.VITE_LAMBDA_GRAPHQL_URI =
      testEnvironmentConfig.lambdaGraphqlUri;
    process.env.VITE_LAMBDA_API_KEY = testEnvironmentConfig.lambdaApiKey;
    process.env.VITE_LOG_LEVEL = testEnvironmentConfig.logLevel;
    process.env.VITE_ENABLE_CACHING =
      testEnvironmentConfig.enableCaching.toString();
    process.env.VITE_ENABLE_DEBUG =
      testEnvironmentConfig.enableDebug.toString();
    process.env.NODE_ENV = "test";
  }
};

// Export individual config values for easy access
export const {
  graphqlUri,
  apiKey,
  awsRegion,
  cognitoUserPoolId,
  cognitoAppClientId,
  lambdaGraphqlUri,
  lambdaApiKey,
  metabaseUrl,
  metabaseUsername,
  metabasePassword,
  logLevel,
  enableCaching,
  enableDebug,
  testUsername,
  testPassword,
  apiTimeout,
  lambdaTimeout,
  testMode,
  enableTestLogging,
} = testEnvironmentConfig;
