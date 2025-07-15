import { gql, useQuery } from "@apollo/client";
import { Widget } from "../../../generated/graphql";
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
  const { data, loading, error } = useQuery(GET_SMART_MENUS, {
    fetchPolicy: "cache-and-network",
  });
  return {
    loading,
    error: error as Error | undefined,
    smartMenus: data?.widgets ?? [],
  };
}
