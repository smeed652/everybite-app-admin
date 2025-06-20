import { gql, useQuery } from '@apollo/client';

export const GET_ALL_WIDGETS_BASICS = gql/* GraphQL */`
  query GetAllWidgetsBasics {
    widgets {
      id
      publishedAt
      displayImages
      layout
      isOrderButtonEnabled
      isByoEnabled
    }
  }
`;

type WidgetBasics = {
  id: string;
  publishedAt?: string | null;
  displayImages: boolean;
  layout?: string | null;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;
};

export function usePlayerAnalytics() {
  const { data, loading, error } = useQuery(GET_ALL_WIDGETS_BASICS, {
    fetchPolicy: 'cache-and-network',
  });

  const widgets = (data?.widgets ?? []) as WidgetBasics[];
  const active = widgets.filter((w) => Boolean(w.publishedAt));
  const totalActive = active.length || 1;

  const withImages = active.filter((w) => w.displayImages).length;
  const withCardLayout = active.filter((w) => (w.layout || '').toUpperCase() === 'CARD').length;
  const withOrdering = active.filter((w) => w.isOrderButtonEnabled).length;
  const withByo = active.filter((w) => w.isByoEnabled).length;

  return {
    loading,
    error,
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  } as const;
}
