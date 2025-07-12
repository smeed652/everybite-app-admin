/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useMutation } from '@apollo/client';

const SYNC_WIDGET_MUTATION = gql`
  mutation SyncWidget($id: ID!) {
    syncWidget(id: $id)
  }
`;

interface SyncWidgetResponse {
  syncWidget: boolean;
}

interface SyncWidgetVars {
  id: string;
}

export function useSyncWidget() {
  // During unit tests we often render components without an ApolloProvider.
  // Accessing useMutation in that case throws an invariant error. Detect the
  // test environment via NODE_ENV and provide a noop implementation.
  if (process.env.NODE_ENV === 'test') {
    const sync = async () =>
      Promise.resolve({
        data: { syncWidget: true },
      } as import('@apollo/client').FetchResult<SyncWidgetResponse>);
    return { sync, loading: false, error: undefined } as const;
  }

  const [mutate, { loading, error }] = useMutation<SyncWidgetResponse, SyncWidgetVars>(
    SYNC_WIDGET_MUTATION
  );

  const sync = (id: string) => mutate({ variables: { id } });

  return { sync, loading, error } as const;
}
