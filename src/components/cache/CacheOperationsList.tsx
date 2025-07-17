import { RefreshCw } from "lucide-react";
import { CacheOperation } from "../../types/cache";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatAge } from "./utils/cacheFormatters";

interface CacheOperationsListProps {
  operations: CacheOperation[];
  refreshingOperations: Set<string>;
  onRefreshOperation: (operationName: string) => void;
}

export function CacheOperationsList({
  operations,
  refreshingOperations,
  onRefreshOperation,
}: CacheOperationsListProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Cache Operations</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {operations.map((operation) => (
          <div
            key={operation.operation}
            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
              operation.isCached
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {operation.displayName || operation.operation}
                  </span>
                  {operation.isCached ? (
                    <Badge variant="default" className="text-xs">
                      {operation.isStale ? "Stale" : "Fresh"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Not Cached
                    </Badge>
                  )}
                </div>
                {operation.isCached && operation.age !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Age: {formatAge(operation.age)}</div>
                    {operation.ttl && <div>TTL: {operation.ttl}m</div>}
                  </div>
                )}
                {!operation.isCached && operation.ttl && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>TTL: {operation.ttl}m</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {operation.isCached ? (
                <Button
                  onClick={() => onRefreshOperation(operation.operation)}
                  disabled={refreshingOperations.has(operation.operation)}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  {refreshingOperations.has(operation.operation) ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No data</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
