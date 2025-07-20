import { gql, useQuery } from "@apollo/client";
import { Widget } from "../../../generated/graphql";
import { apiGraphQLClient } from "../../../lib/api-graphql-apollo";
import { WIDGET_FIELDS } from "../graphql/fragments";

export const GET_WIDGET = gql`
  query GetWidget($id: ID!) {
    widget(id: $id) {
      ...WidgetFields
    }
  }
  ${WIDGET_FIELDS}
`;

interface UseWidgetResult {
  loading: boolean;
  error?: Error;
  widget?: Widget;
  refetch: () => Promise<{ data?: { widget?: Widget } }>;
}

export function useWidget(id: string): UseWidgetResult {
  const { data, loading, error, refetch } = useQuery(GET_WIDGET, {
    client: apiGraphQLClient!,
    variables: { id },
    fetchPolicy: "network-only",
  });
  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
    refetch,
  };
}
