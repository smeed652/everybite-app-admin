import { Settings } from "lucide-react";
import { CacheConfig } from "../../types/cache";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import FormField from "../ui/FormField";
import { Toggle } from "../ui/Toggle";

interface CacheConfigurationCardProps {
  cacheConfig: CacheConfig;
  isSaving: boolean;
  onConfigChange: (config: CacheConfig) => void;
  onSaveConfiguration: () => void;
}

// Define query groups with their display names and descriptions
const QUERY_GROUPS = [
  {
    key: "dashboard",
    name: "Dashboard",
    description: "Dashboard page data, KPIs, metrics, and summary information",
  },
  {
    key: "metabaseUsers",
    name: "Metabase Users",
    description: "Metabase user accounts and login information",
  },
];

export function CacheConfigurationCard({
  cacheConfig,
  isSaving,
  onConfigChange,
  onSaveConfiguration,
}: CacheConfigurationCardProps) {
  // Defensive check for cacheConfig and queryTTLs
  if (!cacheConfig || !cacheConfig.queryTTLs) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Cache Configuration</h3>
        </div>
        <p className="text-gray-600">Loading cache configuration...</p>
      </Card>
    );
  }

  // Helper function to format TTL for display
  const formatTTL = (ttlMs: number): string => {
    const hours = Math.floor(ttlMs / (1000 * 60 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const handleToggleChange = (key: keyof CacheConfig, value: boolean) => {
    onConfigChange({
      ...cacheConfig,
      [key]: value,
    });
  };

  const handleInputChange = (
    key: keyof CacheConfig,
    value: string | number
  ) => {
    onConfigChange({
      ...cacheConfig,
      [key]: value,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Cache Configuration</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Configure cache behavior and scheduled refresh settings
      </p>

      <div className="space-y-6">
        {/* Enable Caching - Horizontal Layout */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Caching
            </label>
            <p className="text-xs text-muted-foreground">
              Enable Apollo cache to improve performance
            </p>
          </div>
          <Toggle
            checked={cacheConfig.enableCaching}
            onChange={(checked) => handleToggleChange("enableCaching", checked)}
            ariaLabel="Enable caching"
          />
        </div>

        {/* Cache TTL */}
        <FormField
          label="Default Cache TTL (hours)"
          description={`Current: ${formatTTL(cacheConfig.cacheTTLHours * 60 * 60 * 1000)}`}
        >
          <input
            type="number"
            min="1"
            max="168"
            value={cacheConfig.cacheTTLHours}
            onChange={(e) =>
              handleInputChange("cacheTTLHours", parseInt(e.target.value, 10))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        {/* Scheduled Refresh - Horizontal Layout */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Scheduled Refresh
            </label>
            <p className="text-xs text-muted-foreground">
              Automatically refresh cache at scheduled time
            </p>
          </div>
          <Toggle
            checked={cacheConfig.scheduledRefreshEnabled}
            onChange={(checked) =>
              handleToggleChange("scheduledRefreshEnabled", checked)
            }
            ariaLabel="Enable scheduled refresh"
          />
        </div>

        {/* Scheduled Refresh Time */}
        <FormField
          label="Refresh Time (HH:MM)"
          description="Time to refresh cache daily"
        >
          <input
            type="time"
            value={cacheConfig.scheduledRefreshTime}
            onChange={(e) =>
              handleInputChange("scheduledRefreshTime", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        {/* Timezone */}
        <FormField
          label="Timezone"
          description="Timezone for scheduled refresh"
        >
          <input
            type="text"
            value={cacheConfig.scheduledRefreshTimezone}
            onChange={(e) =>
              handleInputChange("scheduledRefreshTimezone", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        {/* Query-Specific TTLs - Table Layout */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Query TTL Settings</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Configure individual TTLs for different types of data
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Cache Policy:</strong>
              <br />• <strong>Cached:</strong> Dashboard, Metabase Users
              <br />• <strong>Never Cached:</strong> Users page (REST API),
              SmartMenus CRUD operations (real-time data)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">
                    Query Group
                  </th>
                  <th className="text-left py-2 font-medium text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-2 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-2 font-medium text-gray-700">
                    Current TTL
                  </th>
                  <th className="text-left py-2 font-medium text-gray-700">
                    TTL (hours)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {QUERY_GROUPS.map((group) => {
                  const currentTTL =
                    cacheConfig.queryTTLs?.[
                      group.key as keyof typeof cacheConfig.queryTTLs
                    ] || 0;
                  const ttlHours = Math.floor(currentTTL / (1000 * 60 * 60));

                  return (
                    <tr key={group.key} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">
                        {group.name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {group.description}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Cacheable
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {ttlHours > 0 ? `${ttlHours}h` : "Not set"}
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min="0"
                          max="168" // 1 week max
                          value={ttlHours}
                          onChange={(e) => {
                            const newTTLs = {
                              ...cacheConfig.queryTTLs,
                              [group.key]:
                                parseInt(e.target.value) * 60 * 60 * 1000, // Convert hours to ms
                            };
                            onConfigChange({
                              ...cacheConfig,
                              queryTTLs: newTTLs,
                            });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="24"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={onSaveConfiguration}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </Card>
  );
}
