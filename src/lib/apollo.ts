import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GRAPHQL_API_KEY || '';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'https://api.everybite.com/graphql',
  headers: {
    Authorization: apiKey,
  },
});

// For this project the API expects a static API key; user tokens are not required for GraphQL
// Keep authLink minimal in case future headers need dynamic injection
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    // ensure apiKey present even if httpLink headers overridden elsewhere
    Authorization: apiKey,
  },
}));

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

// Ensure this file is treated as an ES module so `import.meta` is allowed by TypeScript
export {};
