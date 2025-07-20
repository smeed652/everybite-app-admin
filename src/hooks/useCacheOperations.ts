import { useEffect, useState } from "react";
import { OperationCacheStatus, ScheduledRefreshInfo } from "../types/cache";
import {
  clearOperation,
  refreshOperation,
} from "../utils/cacheOperationStrategies";
import {
  calculateScheduledRefreshInfo,
  clearAllCaches,
  refreshAllOperations,
  updateCacheStatus,
} from "../utils/cacheUtils";

export function useCacheOperations() {
  const [operationCacheStatus, setOperationCacheStatus] = useState<
    OperationCacheStatus[]
  >([]);
  const [scheduledInfo, setScheduledInfo] = useState<ScheduledRefreshInfo>({
    enabled: false,
  });

  const updateStatus = () => {
    const allStatuses = updateCacheStatus();
    setOperationCacheStatus(allStatuses);

    const scheduledInfo = calculateScheduledRefreshInfo();
    setScheduledInfo(scheduledInfo);
  };

  useEffect(() => {
    updateStatus();
    // Update status every minute
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshAll = async () => {
    try {
      await clearAllCaches();
      await refreshAllOperations();
      updateStatus();
      return { success: true };
    } catch (error) {
      console.error("Error refreshing cache:", error);
      return { success: false, error };
    }
  };

  const handleClearAllCache = async () => {
    try {
      await clearAllCaches();
      updateStatus();
      return { success: true };
    } catch (error) {
      console.error("Error clearing cache:", error);
      return { success: false, error };
    }
  };

  const handleRefreshOperation = async (operationName: string) => {
    try {
      await refreshOperation(operationName);
      updateStatus();
      return { success: true };
    } catch (error) {
      console.error("Error refreshing operation:", error);
      return { success: false, error };
    }
  };

  const handleClearOperation = async (operationName: string) => {
    try {
      await clearOperation(operationName);
      updateStatus();
      return { success: true };
    } catch (error) {
      console.error("Error clearing operation cache:", error);
      return { success: false, error };
    }
  };

  return {
    operationCacheStatus,
    scheduledInfo,
    updateStatus,
    handleRefreshAll,
    handleClearAllCache,
    handleRefreshOperation,
    handleClearOperation,
  };
}
