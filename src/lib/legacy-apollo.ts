import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Configuration
const API_KEY = import.meta.env.VITE_API_KEY;
const GRAPHQL_URI =
  import.meta.env.VITE_GRAPHQL_URI || "https://api.everybite.com/graphql";

console.log(
  "[LegacyApollo] API Key:",
  API_KEY ? `${API_KEY.substring(0, 8)}...` : "Not set"
);
console.log("[LegacyApollo] GraphQL URI:", GRAPHQL_URI);

// Create HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

// Auth link to add API key
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-api-key": API_KEY,
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[LegacyApollo] GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[LegacyApollo] Network error: ${networkError}`);
  }
});

// Create Apollo client
export const legacyClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          widgets: { merge: false },
          widget: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});
