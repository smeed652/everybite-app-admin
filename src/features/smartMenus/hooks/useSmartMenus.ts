import { gql, useQuery } from '@apollo/client';
import { Widget } from '../../../generated/graphql';

export const GET_SMART_MENUS = gql`
  query GetSmartMenus($search: String) {
    widgets {
      id
      name
      slug
      updatedAt
    }
  }
`;

interface UseSmartMenusResult {
  loading: boolean;
  error?: Error;
  smartMenus: Widget[];
}

export function useSmartMenus(): UseSmartMenusResult {
  const { data, loading, error } = useQuery(GET_SMART_MENUS);
  return {
    loading,
    error: error as Error | undefined,
    smartMenus: data?.widgets ?? [],
  };
}
