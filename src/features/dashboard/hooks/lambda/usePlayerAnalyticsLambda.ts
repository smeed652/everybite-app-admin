import { useQuery } from "@apollo/client";
import { lambdaClient } from "../../../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../../../lib/logger";
import { WIDGETS_FEATURE_ADOPTION } from "../../graphql/lambda/queries/analytics";
import type {
  LambdaWidgetsWithAnalyticsResponse,
  PlayerAnalytics,
} from "../../graphql/types";

export function usePlayerAnalyticsLambda() {
  const { data, loading, error } = useQuery<LambdaWidgetsWithAnalyticsResponse>(
    WIDGETS_FEATURE_ADOPTION,
    {
      client: lambdaClient!,
      fetchPolicy: "cache-and-network",
    }
  );

  // Logging for debugging
  logger.info("[Analytics] Lambda widgets data:", data);
  logger.info("[Analytics] Lambda data structure:", {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    db_widgetsList: data?.db_widgetsList,
    items: data?.db_widgetsList?.items,
    itemsLength: data?.db_widgetsList?.items?.length,
  });
  if (error) logger.error("[Analytics] Lambda error:", error);

  const widgets = data?.db_widgetsList?.items ?? [];
  const active = widgets.filter((w) => Boolean(w.publishedAt));
  const totalActive = active.length || 1;
  const withImages = active.filter((w) => w.displayImages).length;
  const withCardLayout = active.filter(
    (w) => (w.layout || "").toUpperCase() === "CARD"
  ).length;
  const withOrdering = active.filter((w) => w.isOrderButtonEnabled).length;
  const withByo = active.filter((w) => w.isByoEnabled).length;

  const analytics: PlayerAnalytics = {
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  };

  logger.info("[Analytics] Processed analytics:", analytics);

  return {
    analytics,
    loading,
    error: error?.message || null,
  } as const;
}
