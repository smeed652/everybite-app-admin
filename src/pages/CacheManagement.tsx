import { CheckCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CacheConfigurationCard,
  CacheInformationPanel,
  CacheStatusCard,
} from "../components/cache";
import { Button } from "../components/ui/Button";
import { getCacheConfig, setCacheConfig } from "../config/cache-config";
import {
  cacheUtils,
  getScheduledRefreshInfo,
  reinitializeMetabaseClient,
  startScheduledRefresh,
  stopScheduledRefresh,
} from "../lib/metabase-apollo";
import {
  CacheConfig,
  CacheStatusResponse,
  ScheduledRefreshInfo,
} from "../types/cache";

export default function CacheManagement() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatusResponse>({
    enabled: false,
  });
  const [scheduledInfo, setScheduledInfo] = useState<ScheduledRefreshInfo>({
    enabled: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshingOperations, setRefreshingOperations] = useState<Set<string>>(
    new Set()
  );

  // Cache configuration state
  const [cacheConfig, setCacheConfigState] = useState<CacheConfig>({
    enableCaching: false,
    scheduledRefreshEnabled: true,
    scheduledRefreshTime: "06:00",
    scheduledRefreshTimezone: "America/Los_Angeles",
    cacheTTLHours: 24, // 24 hours
    queryTTLs: {
      dashboard: 24 * 60 * 60 * 1000,
      metabaseUsers: 12 * 60 * 60 * 1000,
    },
  });

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

  // Load current configuration
  useEffect(() => {
    const config = getCacheConfig();
    setCacheConfigState({
      enableCaching: cacheUtils.isEnabled(),
      scheduledRefreshEnabled: config.scheduledRefresh.enabled,
      scheduledRefreshTime: config.scheduledRefresh.time,
      scheduledRefreshTimezone: config.scheduledRefresh.timezone,
      cacheTTLHours: Math.floor(config.ttl / (1000 * 60 * 60)), // Convert ms to hours
      queryTTLs: config.queryTTLs,
    });
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      cacheUtils.clearCache();
      updateStatus();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshOperation = async (operationName: string) => {
    setRefreshingOperations((prev) => new Set(prev).add(operationName));
    try {
      await cacheUtils.refreshOperation(operationName);
      updateStatus();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error refreshing operation:", error);
    } finally {
      setRefreshingOperations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(operationName);
        return newSet;
      });
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Convert UI config to the format expected by cache-config
      const newConfig = {
        ttl: cacheConfig.cacheTTLHours * 60 * 60 * 1000, // Convert hours to ms
        scheduledRefresh: {
          enabled: cacheConfig.scheduledRefreshEnabled,
          time: cacheConfig.scheduledRefreshTime,
          timezone: cacheConfig.scheduledRefreshTimezone,
        },
        storage: {
          prefix: "metabase-apollo-cache",
          persistence: true,
        },
        enableCaching: cacheConfig.enableCaching, // Add this for the features.caching getter
        queryTTLs: cacheConfig.queryTTLs,
      };

      // Persist config to localStorage
      setCacheConfig(newConfig);

      // Reinitialize Apollo client and cache logic with new config
      reinitializeMetabaseClient();

      // Restart scheduled refresh with new settings
      stopScheduledRefresh();
      startScheduledRefresh();

      // Update UI state immediately
      updateStatus();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cache Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage Apollo cache settings and scheduled refresh configuration
            </p>
          </div>
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing || !cacheStatus.enabled}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh All"}
          </Button>
        </div>

        {showSuccess && (
          <div className="p-4 border border-green-200 bg-green-50 rounded-md">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Cache configuration updated successfully!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CacheConfigurationCard
            cacheConfig={cacheConfig}
            isSaving={isSaving}
            onConfigChange={setCacheConfigState}
            onSaveConfiguration={handleSaveConfiguration}
          />

          <CacheStatusCard
            cacheStatus={cacheStatus}
            scheduledInfo={scheduledInfo}
            refreshingOperations={refreshingOperations}
            onRefreshOperation={handleRefreshOperation}
          />
        </div>

        <CacheInformationPanel cacheConfig={cacheConfig} />
      </div>
    </div>
  );
}
