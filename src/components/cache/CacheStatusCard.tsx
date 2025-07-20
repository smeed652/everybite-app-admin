import { Clock, Database, RefreshCw, Trash2 } from "lucide-react";
import {
  CacheOperation,
  CacheStatusResponse,
  ScheduledRefreshInfo as ScheduledRefreshInfoType,
  ServiceGroup,
} from "../../types/cache";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CacheOperationsList } from "./CacheOperationsList";
import { ScheduledRefreshInfo } from "./ScheduledRefreshInfo";

interface CacheStatusCardProps {
  cacheStatus: CacheStatusResponse;
  scheduledInfo: ScheduledRefreshInfoType;
  onRefreshOperation: (operationName: string) => void;
  onRefreshServiceGroup: (serviceGroupName: string) => void;
  onClearOperation: (operationName: string) => void;
  onClearServiceGroup: (serviceGroupName: string) => void;
  onViewContents?: (operation: CacheOperation) => void;
  serviceGroups: ServiceGroup[];
}

export function CacheStatusCard({
  cacheStatus,
  scheduledInfo,
  onRefreshOperation,
  onRefreshServiceGroup,
  onClearOperation,
  onClearServiceGroup,
  onViewContents,
  serviceGroups,
}: CacheStatusCardProps) {
  // Get all possible cache operations (even if not currently cached)
  const getAllCacheOperations = (): CacheOperation[] => {
    const cachedOperations = cacheStatus.data || [];

    // The getCacheStatus function now returns all expected operations
    // with a notCached flag for operations that haven't been cached yet
    const operations = cachedOperations.map((operation) => ({
      ...operation,
      isCached: !operation.notCached,
    }));

    return operations;
  };

  // Group operations by service
  const getOperationsByService = () => {
    const allOperations = getAllCacheOperations();

    const grouped = serviceGroups.map((group) => {
      const groupOperations = allOperations.filter((op) =>
        group.operations.includes(op.operation)
      );
      return {
        ...group,
        operations: groupOperations,
      };
    });

    return grouped;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Cache Status</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Current operation-level cache state and scheduled refresh information
      </p>

      <div className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant={cacheStatus.enabled ? "default" : "secondary"}>
              {cacheStatus.enabled ? "Enabled" : "Disabled"}
            </Badge>
            {scheduledInfo.enabled && scheduledInfo.scheduled && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Scheduled
              </Badge>
            )}
          </div>
        </div>

        {/* Scheduled Refresh Info */}
        <ScheduledRefreshInfo scheduledInfo={scheduledInfo} />

        {/* Service Groups */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Service Groups</h4>
          {getOperationsByService().map((serviceGroup) => (
            <div key={serviceGroup.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-sm">
                  {serviceGroup.displayName}
                </h5>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onRefreshServiceGroup(serviceGroup.name)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh All
                  </Button>
                  <Button
                    onClick={() => onClearServiceGroup(serviceGroup.name)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear Cache
                  </Button>
                </div>
              </div>

              {serviceGroup.operations.length > 0 ? (
                <>
                  <CacheOperationsList
                    operations={serviceGroup.operations}
                    onRefreshOperation={onRefreshOperation}
                    onClearOperation={onClearOperation}
                    onViewContents={onViewContents}
                  />

                  {/* Last refreshed timestamp for the service group */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">
                      Last refreshed:{" "}
                      {(() => {
                        const cachedOps = serviceGroup.operations.filter(
                          (op) => op.isCached
                        );
                        if (cachedOps.length === 0) {
                          return "Never";
                        }
                        const maxAge = Math.max(
                          ...cachedOps.map((op) => op.age || 0)
                        );
                        // Convert age in milliseconds to actual timestamp
                        const lastRefreshTime = new Date(Date.now() - maxAge);
                        return lastRefreshTime.toLocaleString();
                      })()}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No operations found for this service group.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
