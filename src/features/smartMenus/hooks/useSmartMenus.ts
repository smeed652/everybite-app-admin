import { gql, useQuery } from "@apollo/client";
import { Widget } from "../../../generated/graphql";
import { apiGraphQLClient } from "../../../lib/api-graphql-apollo";
import { WIDGET_BASIC_FIELDS } from "../graphql/fragments";

export const GET_SMART_MENUS = gql`
  query GetSmartMenus {
    widgets {
      ...WidgetBasicFields
    }
  }
  ${WIDGET_BASIC_FIELDS}
`;

interface UseSmartMenusResult {
  loading: boolean;
  error?: Error;
  smartMenus: Widget[];
}

export function useSmartMenus(): UseSmartMenusResult {
  const { data, loading, error } = useQuery<{
    widgets: Widget[];
  }>(GET_SMART_MENUS, {
    client: apiGraphQLClient,
    fetchPolicy: "cache-first",
  });
  return {
    loading,
    error: error as Error | undefined,
    smartMenus: data?.widgets ?? [],
  };
}
