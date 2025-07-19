import { useQuery } from "@apollo/client";
import { lambdaClient } from "../../../../lib/datawarehouse-lambda-apollo";
import { logger } from "../../../../lib/logger";
import { LAMBDA_GET_PLAYER_ANALYTICS } from "../../graphql/lambda/queries";
import type {
  LambdaPlayerAnalyticsResponse,
  PlayerAnalytics,
} from "../../graphql/types";

export function usePlayerAnalyticsLambda() {
  const { data, loading, error } = useQuery<LambdaPlayerAnalyticsResponse>(
    LAMBDA_GET_PLAYER_ANALYTICS,
    {
      client: lambdaClient!,
      fetchPolicy: "cache-and-network",
    }
  );

  // Logging for debugging
  logger.info("[Analytics] Lambda widgets data:", data);
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

  return {
    analytics,
    loading,
    error: error?.message || null,
  } as const;
}
