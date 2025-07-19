import { useEffect, useState } from "react";
import {
  cacheUtils,
  getScheduledRefreshInfo,
} from "../lib/datawarehouse-lambda-apollo";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface CacheStatus {
  operation: string;
  age: number;
  isStale: boolean;
  notCached?: boolean;
}

interface CacheStatusResponse {
  enabled: boolean;
  message?: string;
  data?: CacheStatus[];
}

interface ScheduledRefreshInfo {
  enabled: boolean;
  scheduled?: boolean;
  message?: string;
  nextRefresh?: string;
  nextRefreshLocal?: string;
  timezone?: string;
  scheduledTime?: string;
}

export function CacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatusResponse>({
    enabled: false,
  });
  const [scheduledInfo, setScheduledInfo] = useState<ScheduledRefreshInfo>({
    enabled: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateStatus = () => {
    const status = cacheUtils.getCacheStatus();
    const scheduled = getScheduledRefreshInfo();
    setCacheStatus(status);
    setScheduledInfo(scheduled);
  };

  useEffect(() => {
    updateStatus();
    // Update status every minute
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await cacheUtils.clearCache();
      updateStatus();
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshOperation = async (operationName: string) => {
    setIsRefreshing(true);
    try {
      await cacheUtils.refreshOperation(operationName);
      updateStatus();
    } catch (error) {
      console.error("Error refreshing operation:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatAge = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      // 24 hours
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days}d ago`;
    }
  };

  const formatTimeUntil = (isoString: string) => {
    const now = new Date();
    const next = new Date(isoString);
    const diffMs = next.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cache Status</h3>
        <div className="flex items-center space-x-2">
          <Badge variant={cacheStatus.enabled ? "default" : "secondary"}>
            {cacheStatus.enabled ? "Enabled" : "Disabled"}
          </Badge>
          {cacheStatus.enabled && (
            <Button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </Button>
          )}
        </div>
      </div>

      {/* Scheduled Refresh Info */}
      {scheduledInfo.enabled && scheduledInfo.scheduled && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm text-blue-900">
                Scheduled Refresh
              </h4>
              <p className="text-xs text-blue-700">
                Daily at {scheduledInfo.scheduledTime} ({scheduledInfo.timezone}
                )
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">
                Next refresh in{" "}
                {scheduledInfo.nextRefresh &&
                  formatTimeUntil(scheduledInfo.nextRefresh)}
              </p>
              <p className="text-xs text-blue-700">
                {scheduledInfo.nextRefreshLocal}
              </p>
            </div>
          </div>
        </div>
      )}

      {!cacheStatus.enabled ? (
        <p className="text-muted-foreground text-sm">
          {cacheStatus.message ||
            "Caching is disabled. Data will be fetched fresh on each request."}
        </p>
      ) : cacheStatus.data && cacheStatus.data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No cached data available. Data will be cached after first fetch.
        </p>
      ) : (
        <div className="space-y-2">
          {cacheStatus.data?.map((status) => (
            <div
              key={status.operation}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{status.operation}</span>
                {status.notCached ? (
                  <Badge variant="secondary">Not Cached</Badge>
                ) : (
                  <Badge variant={status.isStale ? "destructive" : "default"}>
                    {status.isStale ? "Stale" : "Fresh"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {status.notCached ? "No data" : formatAge(status.age)}
                </span>
                <Button
                  onClick={() => handleRefreshOperation(status.operation)}
                  disabled={isRefreshing}
                  variant="ghost"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          {cacheStatus.enabled
            ? "Data is cached for 24 hours to minimize Lambda invocations. Cache is automatically refreshed daily at 6:00 AM PT."
            : "Caching is disabled. Set VITE_ENABLE_CACHING=true to enable caching in development."}
        </p>
      </div>
    </Card>
  );
}
