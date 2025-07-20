import { isAfter, subDays } from "date-fns";
import { useSmartMenuSettings } from "../../../../hooks/useSmartMenuSettings";
import type { DashboardMetrics } from "../../graphql/types";

/**
 * New comprehensive SmartMenu dashboard hook using the SmartMenuSettings service
 * This provides all dashboard data plus additional fields like classifications, ordering status, etc.
 *
 * This is a parallel implementation alongside the existing useDashboardLambda hook.
 * The existing Dashboard infrastructure remains untouched until this is fully validated.
 */
export function useSmartMenuDashboard() {
  const {
    smartMenus: widgets,
    quarterlyMetrics,
    loading,
    error,
    metrics: smartMenuMetrics,
  } = useSmartMenuSettings();

  // Calculate dashboard metrics from the comprehensive SmartMenu data
  const total = smartMenuMetrics.totalSmartMenus;
  const active = smartMenuMetrics.activeSmartMenus;
  const totalLocations = smartMenuMetrics.totalLocations;

  // Compute 30-day trending deltas
  const now = new Date();
  const startCurrent = subDays(now, 30);
  const startPrev = subDays(startCurrent, 30);

  const createdCurr = widgets.filter((w) =>
    isAfter(new Date(w.createdAt), startCurrent)
  ).length;
  const createdPrev = widgets.filter(
    (w) =>
      isAfter(new Date(w.createdAt), startPrev) &&
      !isAfter(new Date(w.createdAt), startCurrent)
  ).length;

  const activeCurr = widgets.filter(
    (w) => w.publishedAt && isAfter(new Date(w.publishedAt), startCurrent)
  ).length;
  const activePrev = widgets.filter(
    (w) =>
      w.publishedAt &&
      isAfter(new Date(w.publishedAt), startPrev) &&
      !isAfter(new Date(w.publishedAt), startCurrent)
  ).length;

  // Calculate location trends for active SmartMenus
  const locationsCurr = widgets
    .filter(
      (w) => w.publishedAt && isAfter(new Date(w.publishedAt), startCurrent)
    )
    .reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);
  const locationsPrev = widgets
    .filter(
      (w) =>
        w.publishedAt &&
        isAfter(new Date(w.publishedAt), startPrev) &&
        !isAfter(new Date(w.publishedAt), startCurrent)
    )
    .reduce((sum, w) => sum + (w.numberOfLocations || 0), 0);

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "0%";
    const v = ((curr - prev) / prev) * 100;
    return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  };

  const totalDelta = pct(createdCurr, createdPrev);
  const activeDelta = pct(activeCurr, activePrev);
  const locationsDelta = pct(locationsCurr, locationsPrev);

  const metrics: DashboardMetrics = {
    total,
    active,
    totalLocations,
    totalDelta,
    activeDelta,
    locationsDelta,
  };

  return {
    widgets,
    metrics,
    quarterlyMetrics,
    loading,
    error,
  } as const;
}
