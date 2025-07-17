import { Clock, Database } from "lucide-react";
import {
  CacheOperation,
  CacheStatusResponse,
  ScheduledRefreshInfo as ScheduledRefreshInfoType,
} from "../../types/cache";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CacheOperationsList } from "./CacheOperationsList";
import { ScheduledRefreshInfo } from "./ScheduledRefreshInfo";

interface CacheStatusCardProps {
  cacheStatus: CacheStatusResponse;
  scheduledInfo: ScheduledRefreshInfoType;
  refreshingOperations: Set<string>;
  onRefreshOperation: (operationName: string) => void;
}

export function CacheStatusCard({
  cacheStatus,
  scheduledInfo,
  refreshingOperations,
  onRefreshOperation,
}: CacheStatusCardProps) {
  // Get all possible cache operations (even if not currently cached)
  const getAllCacheOperations = (): CacheOperation[] => {
    const cachedOperations = cacheStatus.data || [];

    // The getCacheStatus function now returns all expected operations
    // with a notCached flag for operations that haven't been cached yet
    return cachedOperations.map((operation) => ({
      ...operation,
      isCached: !operation.notCached,
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Cache Status</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Current cache state and scheduled refresh information
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

        {/* All Cache Operations */}
        <CacheOperationsList
          operations={getAllCacheOperations()}
          refreshingOperations={refreshingOperations}
          onRefreshOperation={onRefreshOperation}
        />
      </div>
    </Card>
  );
}
