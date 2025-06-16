import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAccessToken } from '../context/AuthContext';
import { currentSession } from './auth';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'https://api.everybite.com/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  let token = '';
  try {
    const session = await currentSession();
    token = session.tokens?.idToken?.toString() || '';
  } catch {
    token = getAccessToken() || '';
  }
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
