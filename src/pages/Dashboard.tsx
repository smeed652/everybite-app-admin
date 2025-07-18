import { isAfter, subDays } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { MetricsCard } from "../components/MetricsCard";
import { QuarterlyMetricsTable } from "../components/QuarterlyMetricsTable";
import { PlayerAnalyticsSection } from "../features/dashboard/sections/PlayerAnalyticsSection";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  // Use consolidated dashboard data hook with proper caching
  const {
    widgets,
    total,
    active,
    totalLocations,
    quarterlyData,
    totalOrders,
    ordersDelta,
    analyticsData,
    loading,
    error,
  } = useDashboardData();

  console.log("Dashboard: quarterlyData:", quarterlyData);
  console.log("Dashboard: analyticsData:", analyticsData);

  // compute 30-day trending deltas
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

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center text-center space-y-2">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <p className="text-sm font-medium text-red-600">
          Failed to load dashboard metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your SmartMenu performance and analytics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="SmartMenus"
          value={total.toLocaleString()}
          delta={totalDelta}
          loading={loading}
        />
        <MetricsCard
          title="Active SmartMenus"
          value={active.toLocaleString()}
          delta={activeDelta}
          loading={loading}
        />
        <MetricsCard
          title="Total Locations"
          value={totalLocations.toLocaleString()}
          delta={locationsDelta}
          loading={loading}
        />
        <MetricsCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          delta={ordersDelta}
          loading={loading}
        />
      </div>

      {/* Quarterly Metrics Table */}
      <QuarterlyMetricsTable
        data={quarterlyData}
        loading={loading}
        error={error}
      />

      {/* Player Analytics Section with consolidated data */}
      <PlayerAnalyticsSection analyticsData={analyticsData} loading={loading} />
    </div>
  );
}
