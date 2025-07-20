import { Eye, RefreshCw, Trash2 } from "lucide-react";
import { CacheOperation } from "../../types/cache";
import { Button } from "../ui/Button";

interface ServiceGroup {
  name: string;
  displayName: string;
  operations: string[];
}

interface CacheServiceGroupProps {
  serviceGroup: ServiceGroup;
  cacheStatus: CacheOperation[];
  onRefreshGroup: (groupName: string) => Promise<void>;
  onClearGroup: (groupName: string) => Promise<void>;
  onRefreshOperation: (operationName: string) => Promise<void>;
  onClearOperation: (operationName: string) => Promise<void>;
  onViewContents: (operation: CacheOperation) => void;
}

export function CacheServiceGroup({
  serviceGroup,
  cacheStatus,
  onRefreshGroup,
  onClearGroup,
  onRefreshOperation,
  onClearOperation,
  onViewContents,
}: CacheServiceGroupProps) {
  const groupOperations = cacheStatus.filter((op) =>
    serviceGroup.operations.includes(op.operation)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{serviceGroup.displayName}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefreshGroup(serviceGroup.name)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClearGroup(serviceGroup.name)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {groupOperations.map((operation) => (
          <div
            key={operation.operation}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{operation.operation}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    operation.isCached && !operation.isStale
                      ? "bg-green-100 text-green-800"
                      : operation.isStale
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {operation.isCached
                    ? operation.isStale
                      ? "stale"
                      : "fresh"
                    : "not cached"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Age: {operation.age || 0}m • TTL: {operation.ttl || 0}m
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewContents(operation)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefreshOperation(operation.operation)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClearOperation(operation.operation)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
