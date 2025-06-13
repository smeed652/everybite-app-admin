import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'https://api.everybite.com/graphql',
});

// Auth link to add the API key to headers
const authLink = setContext((_, { headers }) => {
  // Get the API key from environment variables
  const apiKey = import.meta.env.VITE_GRAPHQL_API_KEY;
  
  // Return the headers with the API key
  return {
    headers: {
      ...headers,
      'x-api-key': apiKey,
    },
  };
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
