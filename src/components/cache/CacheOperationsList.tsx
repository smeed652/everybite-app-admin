import { Eye, RefreshCw, Trash2 } from "lucide-react";
import { CacheOperation } from "../../types/cache";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatAge, formatTTLMs } from "./utils/cacheFormatters";

interface CacheOperationsListProps {
  operations: CacheOperation[];
  onRefreshOperation: (operationName: string) => void;
  onClearOperation: (operationName: string) => void;
  onViewContents?: (operation: CacheOperation) => void;
}

export function CacheOperationsList({
  operations,
  onRefreshOperation,
  onClearOperation,
  onViewContents,
}: CacheOperationsListProps) {
  // Add safety checks
  if (!operations || !Array.isArray(operations)) {
    return (
      <div className="text-sm text-muted-foreground">
        No operations data available.
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No operations found for this service group.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {operations.map((operation) => {
          // Add safety checks for each operation
          if (!operation || !operation.operation) {
            return null;
          }

          return (
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
                      <div>
                        Age:{" "}
                        {formatAge(Math.floor(operation.age / (1000 * 60)))}
                      </div>
                      {operation.ttl && (
                        <div>TTL: {formatTTLMs(operation.ttl)}</div>
                      )}
                    </div>
                  )}
                  {!operation.isCached && operation.ttl && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <div>TTL: {formatTTLMs(operation.ttl)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {operation.isCached && onViewContents && (
                  <Button
                    onClick={() => onViewContents(operation)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                )}
                <Button
                  onClick={() => onRefreshOperation(operation.operation)}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
                {operation.isCached && (
                  <Button
                    onClick={() => onClearOperation(operation.operation)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
