import { gql, useQuery } from '@apollo/client';
import { Widget } from '../../../generated/graphql';

export const GET_SMART_MENUS = gql`
  query GetSmartMenus {
    widgets {
      id
      name
      slug
      updatedAt
      publishedAt
      displayImages
      isSyncEnabled
      isOrderButtonEnabled
      layout
      primaryBrandColor
      highlightColor
      backgroundColor
      orderUrl
    }
  }
`;

interface UseSmartMenusResult {
  loading: boolean;
  error?: Error;
  smartMenus: Widget[];
}

export function useSmartMenus(): UseSmartMenusResult {
  const { data, loading, error } = useQuery(GET_SMART_MENUS, { fetchPolicy: 'cache-and-network' });
  return {
    loading,
    error: error as Error | undefined,
    smartMenus: data?.widgets ?? [],
  };
}
