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

export function useWidgetActiveState() {
  // Use the Apollo client from context if available, otherwise fall back to shared client
  const contextClient = useApolloClient?.();
  const client = contextClient || apiGraphQLClient;

  const activateWidget = async (id: string) => {
    return client.mutate({
      mutation: ACTIVATE_WIDGET,
      variables: { id },
      optimisticResponse: {
        activateWidget: {
          __typename: "Widget",
          id,
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  };

  const deactivateWidget = async (id: string) => {
    return client.mutate({
      mutation: DEACTIVATE_WIDGET,
      variables: { id },
      optimisticResponse: {
        deactivateWidget: {
          __typename: "Widget",
          id,
          isActive: false,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  };

  const toggleWidget = async (id: string, activate: boolean) => {
    return activate ? activateWidget(id) : deactivateWidget(id);
  };

  return {
    activateWidget,
    deactivateWidget,
    toggleWidget,
  };
}
