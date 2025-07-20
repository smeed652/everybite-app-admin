import {
  ApolloClient,
  createHttpLink,
  FetchPolicy,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getQueryTTL } from "../config/cache-config";
import { features } from "../config/environments";
import { getFromCache } from "./cacheUtils";

// Lambda API configuration
const lambdaApiKey = import.meta.env.VITE_LAMBDA_API_KEY;
const lambdaGraphqlUri = import.meta.env.VITE_LAMBDA_GRAPHQL_URI;

// Check if caching is enabled
function isCachingEnabled() {
  return features.caching;
}

// Get fetch policy based on operation TTL
function getOperationFetchPolicy(operationName?: string): FetchPolicy {
  if (!isCachingEnabled()) {
    return "network-only";
  }

  if (!operationName) {
    return "cache-first";
  }

  const ttl = getQueryTTL(operationName);

  // If TTL is 0, never cache
  if (ttl === 0) {
    return "network-only";
  }

  // Check if we have cached data and if it's still valid
  const cachedData = getFromCache("datawarehouse-lambda", operationName);
  if (cachedData) {
    return "cache-first";
  }

  return "cache-first";
}

// Debug logging
console.log(
  "[MetabaseApollo] Lambda API Key:",
  lambdaApiKey ? `${lambdaApiKey.substring(0, 8)}...` : "NOT SET"
);
console.log("[MetabaseApollo] Lambda GraphQL URI:", lambdaGraphqlUri);
console.log("[MetabaseApollo] Caching enabled:", isCachingEnabled());

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[MetabaseApollo] GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[MetabaseApollo] Network error: ${networkError}`);
  }
});

// Auth link to add API key
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-API-Key": lambdaApiKey,
    },
  };
});

// HTTP link
const httpLink = createHttpLink({
  uri: lambdaGraphqlUri,
});

// Apollo client factory (so we can re-initialize)
let lambdaClient: ApolloClient<unknown> | null = null;

function createLambdaClient() {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Disable merging for Lambda queries to prevent field conflicts
          db_widgetsList: { merge: false },
          quarterlyMetrics: { merge: false },
          widgetAnalytics: { merge: false },
          dailyInteractions: { merge: false },
          metabaseUsers: { merge: false },
        },
      },
      // Add type policies for Lambda response types
      DbWidgetsList: {
        keyFields: ["__typename"],
        fields: {
          items: { merge: false },
          pagination: { merge: false },
        },
      },
      PaginationInfo: {
        keyFields: ["__typename"],
      },
    },
  });

  return new ApolloClient({
    link: errorLink.concat(authLink).concat(httpLink),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: getOperationFetchPolicy(),
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: getOperationFetchPolicy(),
        errorPolicy: "all",
      },
    },
  });
}

export function reinitializeLambdaClient() {
  lambdaClient = createLambdaClient();
}

// Initialize on first load
reinitializeLambdaClient();

export { lambdaClient };
