import { gql, useQuery } from "@apollo/client";
import type { Widget } from "../../../generated/graphql";
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
}

export function useWidget(id: string): UseWidgetResult {
  const { data, loading, error } = useQuery(GET_WIDGET, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
  };
}
