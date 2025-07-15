import { gql, useQuery } from "@apollo/client";
import { logger } from "../../../lib/logger";
import { WIDGET_ANALYTICS_FIELDS } from "../../smartMenus/graphql/fragments";

export const GET_ALL_WIDGETS_BASICS = gql`
  query GetAllWidgetsBasics {
    widgets {
      ...WidgetAnalyticsFields
    }
  }
  ${WIDGET_ANALYTICS_FIELDS}
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
  // GraphQL API fetch
  const {
    data,
    loading: gqlLoading,
    error: gqlError,
  } = useQuery(GET_ALL_WIDGETS_BASICS, {
    fetchPolicy: "cache-and-network",
  });

  // Logging for debugging
  logger.info("[Analytics] GraphQL widgets data:", data);
  if (gqlError) logger.error("[Analytics] GraphQL error:", gqlError);

  // GraphQL widget analytics
  const widgets = (data?.widgets ?? []) as WidgetBasics[];
  const active = widgets.filter((w) => Boolean(w.publishedAt));
  const totalActive = active.length || 1;
  const withImages = active.filter((w) => w.displayImages).length;
  const withCardLayout = active.filter(
    (w) => (w.layout || "").toUpperCase() === "CARD"
  ).length;
  const withOrdering = active.filter((w) => w.isOrderButtonEnabled).length;
  const withByo = active.filter((w) => w.isByoEnabled).length;

  return {
    loading: gqlLoading,
    error: gqlError,
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  } as const;
}
