import { AlertTriangle } from "lucide-react";
import {
  calculateOrdersDelta,
  calculateTotalOrders,
  transformQuarterlyData,
} from "../business-logic/quarterly-metrics/transformers";
import { MetricsCard } from "../components/MetricsCard";
import { QuarterlyMetricsTable } from "../components/QuarterlyMetricsTable";
import { useSmartMenuDashboard } from "../features/dashboard/hooks/lambda/useSmartMenuDashboard";
import { PlayerAnalyticsSection } from "../features/dashboard/sections/PlayerAnalyticsSection";

export default function Dashboard() {
  // Use hybrid SmartMenu service for dashboard data (includes quarterly metrics)
  const { metrics, loading, error, quarterlyMetrics } = useSmartMenuDashboard();

  // Use business logic function for data transformation
  const quarterlyData = transformQuarterlyData(quarterlyMetrics);

  // Use business logic functions for calculations
  const totalOrders = calculateTotalOrders(quarterlyData);
  const ordersDelta = calculateOrdersDelta(quarterlyData);

  console.log("Dashboard: quarterlyData:", quarterlyData);
  console.log("Dashboard: quarterlyLoading:", loading);
  console.log("Dashboard: quarterlyError:", error);
  console.log("Dashboard: raw quarterlyMetrics:", quarterlyMetrics);

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
          loading={loading}
        />
      </div>

      {/* Quarterly Metrics Table */}
      <QuarterlyMetricsTable
        data={quarterlyData}
        loading={loading}
        error={error}
      />

      {/* Player Analytics Section */}
      <PlayerAnalyticsSection />
    </div>
  );
}
