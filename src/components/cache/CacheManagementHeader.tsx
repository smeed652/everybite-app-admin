import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

interface CacheManagementHeaderProps {
  onRefreshAll: () => void;
  onClearAllCache: () => void;
}

export function CacheManagementHeader({
  onRefreshAll,
  onClearAllCache,
}: CacheManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Cache Management</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRefreshAll}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
        <Button
          variant="outline"
          onClick={onClearAllCache}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Cache
        </Button>
      </div>
    </div>
  );
}
