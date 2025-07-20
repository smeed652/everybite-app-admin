import { Copy, Download, Eye, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CacheOperation } from "../../types/cache";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";

interface CacheContentsViewerProps {
  operation: CacheOperation;
  isOpen: boolean;
  onClose: () => void;
  onRefreshOperation: (operationName: string) => void;
}

interface CacheData {
  data: unknown;
  metadata: {
    key: string;
    timestamp: number;
    ttl: number;
    size: number;
    age: number;
  };
}

export function CacheContentsViewer({
  operation,
  isOpen,
  onClose,
  onRefreshOperation,
}: CacheContentsViewerProps) {
  const [cacheData, setCacheData] = useState<CacheData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "json">("formatted");
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && operation.operation) {
      loadCacheContents();
    }
  }, [isOpen, operation.operation]);

  const loadCacheContents = async () => {
    if (!operation.operation) return;

    setIsLoading(true);
    try {
      // Special handling for SmartMenuSettingsHybrid
      if (operation.operation === "SmartMenuSettingsHybrid") {
        await loadHybridCacheContents();
        return;
      }

      // Get cache contents from localStorage (not Lambda)
      const storageKey = `metabase-apollo-cache-operation-${operation.operation}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const ttl = operation.ttl || 0;

        setCacheData({
          data,
          metadata: {
            key: storageKey,
            timestamp,
            ttl: ttl,
            size: JSON.stringify(data).length,
            age: Math.round(age / 1000 / 60), // Convert to minutes
          },
        });
      } else {
        setCacheData(null);
      }
    } catch (error) {
      console.error("Error loading cache contents:", error);
      showToast({
        title: "Error loading cache contents",
        description: "Failed to retrieve cached data from localStorage",
        variant: "error",
      });
      setCacheData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHybridCacheContents = async () => {
    try {
      // Import the hybrid service to get its cache data
      const { SmartMenuSettingsHybridService } = await import(
        "../../services/smartmenus/SmartMenuSettingsHybridService"
      );

      const hybridService = new SmartMenuSettingsHybridService();
      const cacheStats = hybridService.getCacheStats();

      // Get the actual data by calling the service
      const result = await hybridService.getSmartMenuSettings();

      setCacheData({
        data: result,
        metadata: {
          key: "SmartMenuSettingsHybrid",
          timestamp: cacheStats.lastFetch,
          ttl: operation.ttl || 0,
          size: JSON.stringify(result).length,
          age: Math.round(cacheStats.cacheAge / 1000 / 60), // Convert to minutes
        },
      });
    } catch (error) {
      console.error("Error loading hybrid cache contents:", error);
      showToast({
        title: "Error loading hybrid cache contents",
        description: "Failed to retrieve hybrid service data",
        variant: "error",
      });
      setCacheData(null);
    }
  };

  const handleRefresh = async () => {
    await onRefreshOperation(operation.operation);
    await loadCacheContents();
  };

  const handleCopyToClipboard = async () => {
    if (!cacheData) return;

    try {
      const jsonString = JSON.stringify(cacheData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      showToast({
        title: "Copied to clipboard",
        description: "Cache contents copied successfully",
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "error",
      });
    }
  };

  const handleDownload = () => {
    if (!cacheData) return;

    const jsonString = JSON.stringify(cacheData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${operation.operation}-cache-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      title: "Downloaded",
      description: "Cache contents downloaded successfully",
      variant: "success",
    });
  };

  const formatData = (data: unknown): string => {
    if (typeof data === "object" && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const renderFormattedData = (data: unknown) => {
    if (!data) return <div className="text-muted-foreground">No data</div>;

    // Handle different data structures
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium">Array ({data.length} items)</div>
          <div className="max-h-96 overflow-y-auto">
            {data.map((item, index) => (
              <div key={index} className="p-2 border rounded bg-gray-50">
                <pre className="text-xs">{formatData(item)}</pre>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof data === "object") {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium">Object</div>
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="p-2 border rounded bg-gray-50">
                <div className="text-xs font-medium text-blue-600">{key}:</div>
                <pre className="text-xs mt-1">{formatData(value)}</pre>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <pre className="text-sm">{formatData(data)}</pre>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-semibold">Cache Contents</h2>
              <p className="text-sm text-muted-foreground">
                {operation.displayName || operation.operation}
              </p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Metadata */}
        {cacheData && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">Cache Key</div>
                <div className="text-xs font-mono">
                  {cacheData.metadata.key}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Age</div>
                <div className="text-xs">
                  {Math.round(cacheData.metadata.age)}m
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600">TTL</div>
                <div className="text-xs">{cacheData.metadata.ttl}m</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Size</div>
                <div className="text-xs">{cacheData.metadata.size} chars</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium text-gray-600">Last Updated</div>
              <div className="text-xs">
                {new Date(cacheData.metadata.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading cache contents...
              </p>
            </div>
          ) : cacheData ? (
            <div className="p-6">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setViewMode("formatted")}
                    variant={viewMode === "formatted" ? "default" : "outline"}
                    size="sm"
                  >
                    Formatted
                  </Button>
                  <Button
                    onClick={() => setViewMode("json")}
                    variant={viewMode === "json" ? "default" : "outline"}
                    size="sm"
                  >
                    JSON
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Data Display */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto p-4 bg-gray-50">
                  {viewMode === "formatted" ? (
                    renderFormattedData(cacheData.data)
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap">
                      {formatData(cacheData.data)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium">No cached data</p>
                <p className="text-sm mt-1">
                  This operation has not been cached yet or the cache has
                  expired.
                </p>
                <Button onClick={handleRefresh} className="mt-4 gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Refresh Operation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
