import { calculateDashboardAnalytics } from "../../../../business-logic/dashboard";
import { useSmartMenuSettings } from "../../../../hooks/useSmartMenuSettings";
import { logger } from "../../../../lib/logger";
import type { PlayerAnalytics } from "../../graphql/types";

export function usePlayerAnalyticsHybrid() {
  const { smartMenus, loading, error } = useSmartMenuSettings();

  // Logging for debugging
  logger.info("[Analytics] Hybrid service data:", {
    smartMenuCount: smartMenus.length,
    hasData: smartMenus.length > 0,
  });

  // Calculate analytics data from active smart menus only
  const active = smartMenus.filter((w) => Boolean(w.publishedAt));
  const totalActive = active.length || 1;
  const withImages = active.filter((w) => w.displayImages).length;
  const withCardLayout = active.filter(
    (w) => (w.layout || "").toUpperCase() === "CARD"
  ).length;
  const withOrdering = active.filter((w) => w.isOrderButtonEnabled).length;
  const withByo = active.filter((w) => w.isByoEnabled).length;

  // Use business logic to calculate analytics
  const analyticsResult = calculateDashboardAnalytics(smartMenus, {
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  });

  // Use business logic result or fallback to basic calculation
  const analytics: PlayerAnalytics =
    analyticsResult.success && analyticsResult.data
      ? analyticsResult.data.analytics
      : {
          totalActive:
            smartMenus.filter((w) => Boolean(w.publishedAt)).length || 1,
          withImages: smartMenus.filter((w) => w.displayImages).length,
          withCardLayout: smartMenus.filter(
            (w) => (w.layout || "").toUpperCase() === "CARD"
          ).length,
          withOrdering: smartMenus.filter((w) => w.isOrderButtonEnabled).length,
          withByo: smartMenus.filter((w) => w.isByoEnabled).length,
        };

  logger.info(
    "[Analytics] Processed analytics from hybrid service:",
    analytics
  );

  return {
    analytics,
    loading,
    error: error || null,
  } as const;
}
