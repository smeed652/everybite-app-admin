import {
  calculateDashboardMetrics,
  convertToDashboardMetrics,
} from "../../../../business-logic/dashboard";
import { useSmartMenuSettings } from "../../../../hooks/useSmartMenuSettings";
import type { DashboardMetrics as GraphQLDashboardMetrics } from "../../graphql/types";

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

  // Use business logic to calculate dashboard metrics
  const dashboardResult = calculateDashboardMetrics(widgets);

  // Use business logic result or fallback to service metrics
  const metrics: GraphQLDashboardMetrics =
    dashboardResult.success && dashboardResult.data
      ? convertToDashboardMetrics(dashboardResult.data)
      : {
          total: smartMenuMetrics.totalSmartMenus,
          active: smartMenuMetrics.activeSmartMenus,
          totalLocations: smartMenuMetrics.totalLocations,
          totalDelta: "0%",
          activeDelta: "0%",
          locationsDelta: "0%",
        };

  return {
    widgets,
    metrics,
    quarterlyMetrics,
    loading,
    error,
  } as const;
}
