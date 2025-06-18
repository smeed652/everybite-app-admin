import { gql, useQuery } from '@apollo/client';
import { Widget } from '../../../generated/graphql';

export const GET_WIDGET = gql`
  query GetWidget($id: ID!) {
    widget(id: $id) {
      id
      name
      slug
      layout
      displayImages
      isActive
      isOrderButtonEnabled
      primaryBrandColor
      highlightColor
      backgroundColor
      orderUrl
      updatedAt
      publishedAt
    }
  }
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
    fetchPolicy: 'cache-and-network',
  });
  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
  };
}
