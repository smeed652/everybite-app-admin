import { gql, useQuery } from "@apollo/client";
import { Widget } from "../../../generated/graphql";
import { lambdaClient } from "../../../lib/datawarehouse-lambda-apollo";
import { WIDGET_BASIC_FIELDS } from "../graphql/fragments";

export const GET_WIDGET = gql`
  query GetWidget($id: ID!) {
    widget(id: $id) {
      ...WidgetBasicFields
    }
  }
  ${WIDGET_BASIC_FIELDS}
`;

interface UseWidgetResult {
  loading: boolean;
  error?: Error;
  widget?: Widget;
}

export function useWidget(id: string): UseWidgetResult {
  const { data, loading, error } = useQuery(GET_WIDGET, {
    client: lambdaClient!,
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
  };
}
