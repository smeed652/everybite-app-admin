import { METABASE_USERS_QUERY } from "../components/cache/constants";
import { getCacheConfig } from "../config/cache-config";
import { lambdaService } from "../services/base/lambdaService";
import { dashboardService } from "../services/datawarehouse-lambda/dashboardService";
import { OperationCacheStatus, ScheduledRefreshInfo } from "../types/cache";

export function updateCacheStatus(): OperationCacheStatus[] {
  return lambdaService.getAllOperationCacheStatus();
}

export function calculateScheduledRefreshInfo(): ScheduledRefreshInfo {
  const config = getCacheConfig();

  if (!config.scheduledRefresh.enabled) {
    return { enabled: false };
  }

  const now = new Date();
  const [hours, minutes] = config.scheduledRefresh.time.split(":").map(Number);

  // Calculate next refresh time
  const nextRefresh = new Date();
  nextRefresh.setHours(hours, minutes, 0, 0);

  // If today's scheduled time has passed, set it to tomorrow
  if (nextRefresh <= now) {
    nextRefresh.setDate(nextRefresh.getDate() + 1);
  }

  return {
    enabled: true,
    scheduled: true,
    scheduledTime: config.scheduledRefresh.time,
    timezone: config.scheduledRefresh.timezone,
    nextRefresh: nextRefresh.toISOString(),
  };
}

export async function clearAllCaches(): Promise<void> {
  // Clear all operation caches
  lambdaService.clearAllOperationCaches();

  // Clear Apollo cache to prevent field conflicts
  await lambdaService.clearCache();
}

export async function refreshAllOperations(): Promise<void> {
  const refreshPromises = [];

  // Refresh dashboard operations
  refreshPromises.push(dashboardService.refreshAllDashboardData());

  // Refresh MetabaseUsers operation
  const networkConfig = { defaultFetchPolicy: "network-only" as const };
  refreshPromises.push(
    lambdaService.query(
      METABASE_USERS_QUERY,
      { page: 1, pageSize: 50 },
      networkConfig
    )
  );

  // Wait for all operations to complete
  await Promise.all(refreshPromises);

  // Wait a moment for cache to be updated
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
