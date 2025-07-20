import { Settings } from "lucide-react";
import { CacheConfig } from "../../types/cache";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import FormField from "../ui/FormField";
import { Toggle } from "../ui/Toggle";

interface CacheConfigurationCardProps {
  cacheConfig: CacheConfig;
  isSaving: boolean;
  hasChanges: boolean;
  onConfigChange: (config: CacheConfig) => void;
  onSaveConfiguration: () => void;
}

// Define operation groups with their display names and descriptions
const OPERATION_GROUPS = [
  {
    key: "smartmenu",
    name: "SmartMenu Operations",
    description: "SmartMenu settings and analytics",
    operations: [
      {
        key: "SmartMenuSettingsHybrid",
        name: "SmartMenu Settings (Hybrid)",
        description:
          "Hybrid SmartMenu settings with main API + Lambda data (uses default TTL)",
      },
    ],
  },
  {
    key: "users",
    name: "User Operations",
    description: "User management operations",
    operations: [
      {
        key: "MetabaseUsers",
        name: "Metabase Users",
        description: "Metabase user list and management (uses default TTL)",
      },
    ],
  },
];

export function CacheConfigurationCard({
  cacheConfig,
  isSaving,
  hasChanges,
  onConfigChange,
  onSaveConfiguration,
}: CacheConfigurationCardProps) {
  // Defensive check for cacheConfig and operationTTLs
  if (!cacheConfig || !cacheConfig.operationTTLs) {
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
    if (ttlMs === 0) return "No cache";
    const hours = Math.floor(ttlMs / (1000 * 60 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours < 1) {
      const minutes = Math.floor(ttlMs / (1000 * 60));
      return `${minutes}m`;
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
        Configure operation-level cache behavior and scheduled refresh settings
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

        {/* Operation-Specific TTLs - Table Layout */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Operation TTL Settings</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Configure TTLs for different GraphQL operations (each operation
              has its own cache)
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Cache Policy:</strong>
              <br />• <strong>Default TTL:</strong> All operations use the
              default TTL (24 hours) unless specified below
              <br />• <strong>Real-time Operations:</strong> Never cached -
              SmartMenu CRUD operations require real-time data
              <br />• <strong>Hybrid Approach:</strong> Single service provides
              all dashboard data with intelligent caching
            </p>
          </div>

          {OPERATION_GROUPS.map((group) => (
            <div key={group.key} className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {group.operations.map((operation) => {
                      const currentTTL =
                        cacheConfig.operationTTLs?.[operation.key] ||
                        cacheConfig.cacheTTLHours * 60 * 60 * 1000; // Use default TTL if not set
                      const ttlHours = Math.floor(
                        currentTTL / (1000 * 60 * 60)
                      );

                      return (
                        <tr key={operation.key} className="hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-900 w-1/3">
                            {operation.name}
                          </td>
                          <td className="py-3 text-gray-600 flex-1">
                            {operation.description}
                          </td>
                          <td className="py-3 text-gray-600 w-24 text-center">
                            {formatTTL(currentTTL)}
                          </td>
                          <td className="py-3 w-32">
                            <input
                              type="number"
                              min="0"
                              max="168" // 1 week max
                              value={ttlHours}
                              onChange={(e) => {
                                const newTTLs = {
                                  ...cacheConfig.operationTTLs,
                                  [operation.key]:
                                    parseInt(e.target.value) * 60 * 60 * 1000, // Convert hours to ms
                                };
                                onConfigChange({
                                  ...cacheConfig,
                                  operationTTLs: newTTLs,
                                });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          ))}
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-end space-y-2">
          <Button
            onClick={onSaveConfiguration}
            disabled={isSaving || !hasChanges}
            className="gap-2"
            variant={hasChanges ? "default" : "outline"}
          >
            {isSaving
              ? "Saving..."
              : hasChanges
                ? "Save Configuration"
                : "Save Configuration"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
