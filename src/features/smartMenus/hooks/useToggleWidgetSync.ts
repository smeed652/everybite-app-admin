import { gql, useApolloClient } from '@apollo/client';

const ACTIVATE_WIDGET_SYNC = gql`
  mutation ActivateWidgetSync($id: ID!) {
    activateWidgetSync(id: $id) {
      id
      isSyncEnabled
    }
  }
`;

const DEACTIVATE_WIDGET_SYNC = gql`
  mutation DeactivateWidgetSync($id: ID!) {
    deactivateWidgetSync(id: $id) {
      id
      isSyncEnabled
    }
  }
`;

export function useToggleWidgetSync() {
  const client = useApolloClient();

  const toggleWidgetSync = async (id: string, enable: boolean) => {
    const MUTATION = enable ? ACTIVATE_WIDGET_SYNC : DEACTIVATE_WIDGET_SYNC;
    return client.mutate({
      mutation: MUTATION,
      variables: { id },
      optimisticResponse: {
        [enable ? 'activateWidgetSync' : 'deactivateWidgetSync']: {
          __typename: 'Widget',
          id,
          isSyncEnabled: enable,
        },
      },
    });
  };

  return { toggleWidgetSync };
}
