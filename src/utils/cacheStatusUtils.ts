import { SERVICE_GROUPS } from "../components/cache/constants";
import { getCacheConfig } from "../config/cache-config";
import { OperationCacheStatus } from "../types/cache";

export function getCacheStatusResponse(
  operationCacheStatus: OperationCacheStatus[],
  enableCaching: boolean
) {
  // Get all expected operations from service groups
  const expectedOperations = SERVICE_GROUPS.flatMap(
    (group) => group.operations
  );

  // Get cache configuration for TTL values
  const cacheConfig = getCacheConfig();

  // Debug logging
  console.log("[CacheStatusUtils] Cache config:", {
    operationTTLs: JSON.stringify(cacheConfig.operationTTLs, null, 2),
    defaultTTL: cacheConfig.ttl,
  });

  // Create a map of actual cache status by operation name
  const cacheStatusMap = new Map(
    operationCacheStatus.map((status) => [status.operationName, status])
  );

  // Create data array with all expected operations, using actual cache status when available
  const data = expectedOperations.map((operationName) => {
    const actualStatus = cacheStatusMap.get(operationName);

    if (actualStatus) {
      return {
        operation: operationName,
        isCached: actualStatus.exists && !actualStatus.isExpired,
        isStale: actualStatus.isExpired || false,
        age: actualStatus.age || 0,
        ttl: actualStatus.ttl || 0,
      };
    } else {
      // Use default TTL for operations that haven't been cached yet
      // Only use operation-specific TTL if it's explicitly set (not from old saved config)
      const operationTTL = cacheConfig.operationTTLs?.[operationName];
      const configuredTTL =
        operationTTL !== undefined && operationTTL > 0
          ? operationTTL
          : cacheConfig.ttl;

      // Debug logging for MetabaseUsers
      if (operationName === "MetabaseUsers") {
        console.log("[CacheStatusUtils] MetabaseUsers TTL:", {
          operationName,
          configuredTTL,
          fromOperationTTLs: cacheConfig.operationTTLs?.[operationName],
          defaultTTL: cacheConfig.ttl,
        });
      }

      return {
        operation: operationName,
        isCached: false,
        isStale: false,
        age: 0,
        ttl: configuredTTL,
      };
    }
  });

  return {
    enabled: enableCaching,
    data,
  };
}
