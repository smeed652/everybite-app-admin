import React from "react";
import { useSmartMenuSettingsHybrid } from "../hooks/useSmartMenuSettingsHybrid";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

/**
 * Demo component showing the hybrid SmartMenu service in action
 * Displays performance comparison between main API and Lambda
 */
export function SmartMenuHybridDemo() {
  const {
    data,
    loading,
    error,
    refetch,
    comparePerformance,
    clearCache,
    getCacheStats,
  } = useSmartMenuSettingsHybrid();

  const [performanceComparison, setPerformanceComparison] =
    React.useState<any>(null);
  const [cacheStats, setCacheStats] = React.useState<any>(null);

  const handleComparePerformance = async () => {
    try {
      const comparison = await comparePerformance();
      setPerformanceComparison(comparison);
    } catch (err) {
      console.error("Performance comparison failed:", err);
    }
  };

  const handleGetCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    clearCache();
    setCacheStats(null);
    // Refetch data to show cache miss
    refetch();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          SmartMenu Hybrid Service Demo
        </h2>
        <div className="text-gray-600">Loading SmartMenu data...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          SmartMenu Hybrid Service Demo
        </h2>
        <div className="text-red-600 mb-4">Error: {error.message}</div>
        <Button onClick={refetch}>Retry</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        SmartMenu Hybrid Service Demo
      </h2>

      {/* Performance Metrics */}
      {data && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Main API Time</div>
              <div className="text-lg font-semibold">
                {data.performanceMetrics.mainApiTime}ms
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Lambda Time</div>
              <div className="text-lg font-semibold">
                {data.performanceMetrics.lambdaTime}ms
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-lg font-semibold">
                {data.performanceMetrics.totalTime}ms
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Cache Hit</div>
              <div className="text-lg font-semibold">
                <Badge
                  variant={
                    data.performanceMetrics.cacheHit ? "default" : "secondary"
                  }
                >
                  {data.performanceMetrics.cacheHit ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Summary */}
      {data && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Data Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600">SmartMenus</div>
              <div className="text-lg font-semibold text-blue-800">
                {data.smartMenus.length}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600">Quarterly Metrics</div>
              <div className="text-lg font-semibold text-green-800">
                {data.quarterlyMetrics.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Info */}
      {data && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Cache Information</h3>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">
              Last Fetch: {new Date(data.cacheInfo.lastFetch).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Cache Version: {data.cacheInfo.cacheVersion}
            </div>
            <div className="text-sm text-gray-600">
              Has Changes: {data.cacheInfo.hasChanges ? "Yes" : "No"}
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison */}
      {performanceComparison && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Performance Comparison</h3>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="text-sm text-yellow-600">Recommendation</div>
            <div className="text-lg font-semibold text-yellow-800">
              {performanceComparison.recommendation}
            </div>
            <div className="text-sm text-yellow-600 mt-2">
              Main API: {performanceComparison.mainApiTime}ms | Lambda:{" "}
              {performanceComparison.lambdaTime}ms
            </div>
          </div>
        </div>
      )}

      {/* Cache Stats */}
      {cacheStats && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Cache Statistics</h3>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-purple-600">
              Cache Age: {cacheStats.cacheAge}ms
            </div>
            <div className="text-sm text-purple-600">
              Cache Version: {cacheStats.cacheVersion}
            </div>
            <div className="text-sm text-purple-600">
              Last Fetch: {new Date(cacheStats.lastFetch).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={refetch} variant="outline">
          Refetch Data
        </Button>
        <Button onClick={handleComparePerformance} variant="outline">
          Compare Performance
        </Button>
        <Button onClick={handleGetCacheStats} variant="outline">
          Get Cache Stats
        </Button>
        <Button onClick={handleClearCache} variant="destructive">
          Clear Cache
        </Button>
      </div>
    </Card>
  );
}
