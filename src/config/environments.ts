// Environment-specific configuration
export interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
  logLevel: string;
  sentryDsn?: string;
  features: {
    analytics: boolean;
    notifications: boolean;
    debugMode: boolean;
    caching: boolean; // New caching feature flag
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: "Development",
    apiUrl: import.meta.env.VITE_GRAPHQL_URI || "http://localhost:4000/graphql",
    cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    cognitoClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || "",
    logLevel: import.meta.env.VITE_LOG_LEVEL || "debug",
    features: {
      analytics: false,
      notifications: false,
      debugMode: true,
      caching: import.meta.env.VITE_ENABLE_CACHING === "true", // Can be overridden via env var
    },
  },
  staging: {
    name: "Staging",
    apiUrl:
      import.meta.env.VITE_GRAPHQL_URI ||
      "https://api-staging.everybite.com/graphql",
    cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    cognitoClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || "",
    logLevel: import.meta.env.VITE_LOG_LEVEL || "info",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    features: {
      analytics: true,
      notifications: false,
      debugMode: false,
      caching: true, // Always enabled in staging
    },
  },
  production: {
    name: "Production",
    apiUrl:
      import.meta.env.VITE_GRAPHQL_URI || "https://api.everybite.com/graphql",
    cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    cognitoClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || "",
    logLevel: import.meta.env.VITE_LOG_LEVEL || "warn",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    features: {
      analytics: true,
      notifications: true,
      debugMode: false,
      caching: true, // Always enabled in production
    },
  },
};

// Determine current environment based on URL or environment variable
const getCurrentEnvironment = (): string => {
  const hostname = window.location.hostname;

  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return "development";
  }

  if (hostname.includes("staging") || hostname.includes("admin-staging")) {
    return "staging";
  }

  if (hostname.includes("everybite.com") && !hostname.includes("staging")) {
    return "production";
  }

  // Fallback to environment variable
  return import.meta.env.MODE || "development";
};

export const currentEnvironment = getCurrentEnvironment();
export const config = environments[currentEnvironment];

// Environment-specific utilities
export const isDevelopment = currentEnvironment === "development";
export const isStaging = currentEnvironment === "staging";
export const isProduction = currentEnvironment === "production";

// Feature flags
export const features = {
  ...config.features,
  get caching() {
    // Check localStorage for cacheConfig first
    try {
      const raw = localStorage.getItem("cacheConfig");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.enableCaching === "boolean") {
          return parsed.enableCaching;
        }
      }
    } catch (e) {
      // ignore
    }
    // Fallback to env/config
    return config.features.caching;
  },
};

// Logging configuration
export const logConfig = {
  level: config.logLevel,
  enableConsole: isDevelopment || isStaging,
  enableRemote: isProduction || isStaging,
  remoteDsn: config.sentryDsn,
};

// API configuration
export const apiConfig = {
  url: config.apiUrl,
  timeout: isProduction ? 10000 : 30000, // Shorter timeout in production
  retries: isProduction ? 1 : 3, // Fewer retries in production
};

// Authentication configuration
export const authConfig = {
  userPoolId: config.cognitoUserPoolId,
  clientId: config.cognitoClientId,
  region: import.meta.env.VITE_AWS_REGION || "us-west-1",
};

export default config;
