import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import type { ReactNode } from 'react';
import { apolloClient } from '@/lib/apollo-client';

type ApolloProviderProps = {
  children: ReactNode;
};

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
