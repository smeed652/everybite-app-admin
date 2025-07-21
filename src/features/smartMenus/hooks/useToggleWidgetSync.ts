import { gql, useApolloClient } from "@apollo/client";
import { apiGraphQLClient } from "../../../lib/api-graphql-apollo";
import { WIDGET_FIELDS } from "../graphql/fragments";

export const ACTIVATE_WIDGET = gql`
  mutation ActivateWidget($id: ID!) {
    activateWidget(id: $id) {
      ...WidgetFields
    }
  }
  ${WIDGET_FIELDS}
`;

export const DEACTIVATE_WIDGET = gql`
  mutation DeactivateWidget($id: ID!) {
    deactivateWidget(id: $id) {
      ...WidgetFields
    }
  }
  ${WIDGET_FIELDS}
`;

export function useToggleWidgetSync() {
  // Use the Apollo client from context if available, otherwise fall back to shared client
  const contextClient = useApolloClient?.();
  const client = contextClient || apiGraphQLClient;

  const toggleWidgetSync = async (id: string, enable: boolean) => {
    const mutation = enable ? ACTIVATE_WIDGET : DEACTIVATE_WIDGET;
    const optimisticResponse = enable
      ? {
          activateWidget: {
            __typename: "Widget",
            id,
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
        }
      : {
          deactivateWidget: {
            __typename: "Widget",
            id,
            isActive: false,
            updatedAt: new Date().toISOString(),
          },
        };
    return client.mutate({
      mutation,
      variables: { id },
      optimisticResponse,
    });
  };

  return { toggleWidgetSync };
}
