import { useEffect, useState } from "react";
import { getCacheConfig, setCacheConfig } from "../config/cache-config";
import { reinitializeLambdaClient } from "../lib/datawarehouse-lambda-apollo";
import { lambdaService } from "../services/base/lambdaService";
import { CacheConfig } from "../types/cache";

export function useCacheConfiguration() {
  const [cacheConfig, setCacheConfigState] = useState<CacheConfig>({
    enableCaching: false,
    scheduledRefreshEnabled: true,
    scheduledRefreshTime: "06:00",
    scheduledRefreshTimezone: "America/Los_Angeles",
    cacheTTLHours: 24, // 24 hours
    operationTTLs: {
      // SmartMenus operations (never cached - real-time data required)
      GetWidget: 0, // Never cached
      GetWidgets: 0, // Never cached
      GetSmartMenus: 0, // Never cached

      // User operations
      GetUser: 0, // Never cached - single user details (real-time)
      // All other operations will use the default TTL (24 hours)
    },
  });

  // Track original configuration for change detection
  const [originalConfig, setOriginalConfig] = useState<CacheConfig | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Check if configuration has changed
  const hasChanges = (): boolean => {
    if (!originalConfig) return false;

    return (
      cacheConfig.enableCaching !== originalConfig.enableCaching ||
      cacheConfig.scheduledRefreshEnabled !==
        originalConfig.scheduledRefreshEnabled ||
      cacheConfig.scheduledRefreshTime !==
        originalConfig.scheduledRefreshTime ||
      cacheConfig.scheduledRefreshTimezone !==
        originalConfig.scheduledRefreshTimezone ||
      cacheConfig.cacheTTLHours !== originalConfig.cacheTTLHours ||
      JSON.stringify(cacheConfig.operationTTLs) !==
        JSON.stringify(originalConfig.operationTTLs)
    );
  };

  // Load current configuration
  useEffect(() => {
    const config = getCacheConfig();

    // Handle operationTTLs that might be a JSON string
    let operationTTLs = config.operationTTLs;
    if (typeof operationTTLs === "string") {
      try {
        operationTTLs = JSON.parse(operationTTLs);
      } catch (e) {
        console.warn(
          "[useCacheConfiguration] Error parsing operationTTLs string:",
          e
        );
        operationTTLs = {};
      }
    }

    const uiConfig = {
      enableCaching: config.enableCaching,
      scheduledRefreshEnabled: config.scheduledRefresh.enabled,
      scheduledRefreshTime: config.scheduledRefresh.time,
      scheduledRefreshTimezone: config.scheduledRefresh.timezone,
      cacheTTLHours: Math.floor(config.ttl / (1000 * 60 * 60)), // Convert ms to hours
      operationTTLs: {
        // Default operation TTLs - only operations that should never be cached
        GetWidget: 0, // Never cached
        GetWidgets: 0, // Never cached
        GetSmartMenus: 0, // Never cached
        GetUser: 0, // Never cached
        // All other operations will use the default TTL (24 hours)
        // Merge with any saved configuration
        ...operationTTLs,
      },
    };
    setCacheConfigState(uiConfig);
    setOriginalConfig(uiConfig); // Set original config for change detection
  }, []);

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
        enableCaching: cacheConfig.enableCaching,
        operationTTLs: cacheConfig.operationTTLs,
      };

      // Persist config to localStorage
      setCacheConfig(newConfig);

      // Update TTLs in the service
      Object.entries(cacheConfig.operationTTLs).forEach(([operation, ttl]) => {
        lambdaService.updateOperationTTL(operation, ttl);
      });

      // Reinitialize Apollo client and cache logic with new config
      reinitializeLambdaClient();

      // Reset original config to current config since changes have been saved
      setOriginalConfig(cacheConfig);

      return { success: true };
    } catch (error) {
      console.error("Error saving configuration:", error);
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    cacheConfig,
    originalConfig,
    isSaving,
    setCacheConfigState,
    hasChanges,
    handleSaveConfiguration,
  };
}
