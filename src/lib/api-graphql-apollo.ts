import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import fetch from "cross-fetch";

// Utility to get env vars from both Vite and Node
export function getEnvVar(key: string, defaultValue = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

export function createApiGraphQLClient(
  apiKeyOverride?: string,
  uriOverride?: string
) {
  const apiKey = apiKeyOverride ?? getEnvVar("VITE_API_KEY", "");
  const graphqlUri =
    uriOverride ??
    getEnvVar("VITE_GRAPHQL_URI", "https://api.everybite.com/graphql");

  const httpLink = createHttpLink({
    uri: graphqlUri,
    fetch,
  });

  const authLink = setContext((_, { headers }) => {
    const finalHeaders = {
      ...headers,
      Authorization: apiKey,
    };
    // Debug: print headers for each request
    if (process.env.NODE_ENV === "test") {
      console.log("[Apollo AuthLink] Request headers:", finalHeaders);
    }
    return { headers: finalHeaders };
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

// Default export for app usage
export const apiGraphQLClient = createApiGraphQLClient();
