import { CacheConfig } from "../../types/cache";
import { Card } from "../ui/Card";
import { formatTTL } from "./utils/cacheFormatters";

interface CacheInformationPanelProps {
  cacheConfig: CacheConfig;
}

export function CacheInformationPanel({
  cacheConfig,
}: CacheInformationPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cache Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium mb-2">Benefits</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Reduces Lambda invocations</li>
            <li>• Improves page load performance</li>
            <li>• Provides offline data access</li>
            <li>• Automatic daily refresh ensures fresh data</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Configuration</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Cache TTL: {formatTTL(cacheConfig.cacheTTLHours)}</li>
            <li>• Storage: localStorage</li>
            <li>
              • Refresh Policy: Daily at {cacheConfig.scheduledRefreshTime}
            </li>
            <li>• Timezone: {cacheConfig.scheduledRefreshTimezone}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
