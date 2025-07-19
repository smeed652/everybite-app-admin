import { useQuery } from "@apollo/client";
import { isAfter, subDays } from "date-fns";
import { lambdaClient } from "../../../../lib/datawarehouse-lambda-apollo";
import { LAMBDA_GET_DASHBOARD_WIDGETS } from "../../graphql/lambda/queries";
import type {
  DashboardMetrics,
  LambdaWidgetsResponse,
} from "../../graphql/types";

export function useDashboardLambda() {
  const { data, loading, error } = useQuery<LambdaWidgetsResponse>(
    LAMBDA_GET_DASHBOARD_WIDGETS,
    {
      client: lambdaClient!,
      fetchPolicy: "cache-and-network",
    }
  );

  const widgets = data?.db_widgetsList?.items ?? [];
  const total = widgets.length;
  const active = widgets.filter((w) => Boolean(w.publishedAt)).length;

  // Calculate total locations for active SmartMenus
  const activeWidgets = widgets.filter((w) => Boolean(w.publishedAt));
  const totalLocations = activeWidgets.reduce(
    (sum, w) => sum + (w.numberOfLocations || 0),
    0
  );

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
    loading,
    error: error?.message || null,
  } as const;
}
