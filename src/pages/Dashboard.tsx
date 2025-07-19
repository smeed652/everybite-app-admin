import { AlertTriangle } from "lucide-react";
import { MetricsCard } from "../components/MetricsCard";
import { QuarterlyMetricsTable } from "../components/QuarterlyMetricsTable";
import {
  useDashboardLambda,
  useQuarterlyMetricsLambda,
} from "../features/dashboard/hooks/lambda";
import { PlayerAnalyticsSection } from "../features/dashboard/sections/PlayerAnalyticsSection";

export default function Dashboard() {
  // Use Lambda hooks for dashboard data
  const { metrics, loading, error } = useDashboardLambda();

  // Use the Lambda quarterly metrics hook
  const {
    quarterlyData,
    totalOrders,
    ordersDelta,
    loading: quarterlyLoading,
    error: quarterlyError,
  } = useQuarterlyMetricsLambda();

  console.log("Dashboard: quarterlyData:", quarterlyData);
  console.log("Dashboard: quarterlyLoading:", quarterlyLoading);
  console.log("Dashboard: quarterlyError:", quarterlyError);

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
          value={metrics.total.toLocaleString()}
          delta={metrics.totalDelta}
          loading={loading}
        />
        <MetricsCard
          title="Active SmartMenus"
          value={metrics.active.toLocaleString()}
          delta={metrics.activeDelta}
          loading={loading}
        />
        <MetricsCard
          title="Total Locations"
          value={metrics.totalLocations.toLocaleString()}
          delta={metrics.locationsDelta}
          loading={loading}
        />
        <MetricsCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          delta={ordersDelta}
          loading={quarterlyLoading}
        />
      </div>

      {/* Quarterly Metrics Table */}
      <QuarterlyMetricsTable
        data={quarterlyData}
        loading={quarterlyLoading}
        error={quarterlyError}
      />

      {/* Player Analytics Section */}
      <PlayerAnalyticsSection loading={loading} />
    </div>
  );
}
