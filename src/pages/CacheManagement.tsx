import { CacheConfigurationCard, CacheStatusCard } from "../components/cache";
import { CacheContentsViewer } from "../components/cache/CacheContentsViewer";
import { CacheManagementHeader } from "../components/cache/CacheManagementHeader";
import { SERVICE_GROUPS } from "../components/cache/constants";
import { useToast } from "../components/ui/ToastProvider";
import { useCacheManagement } from "../hooks/useCacheManagement";
import { useServiceGroupOperations } from "../hooks/useServiceGroupOperations";
import { getCacheStatusResponse } from "../utils/cacheStatusUtils";

export default function CacheManagement() {
  const { showToast } = useToast();
  const {
    // State
    operationCacheStatus,
    scheduledInfo,
    isSaving,
    selectedOperation,
    isViewerOpen,
    cacheConfig,

    // Actions
    setCacheConfigState,
    hasChanges,
    updateStatus,
    handleRefreshAll,
    handleClearAllCache,
    handleRefreshOperation,
    handleClearOperation,
    handleSaveConfiguration,
    handleViewContents,
    handleCloseViewer,
  } = useCacheManagement();

  // Service group operations
  const {
    handleRefreshServiceGroupWithToast,
    handleClearServiceGroupWithToast,
  } = useServiceGroupOperations(
    handleRefreshOperation,
    handleClearOperation,
    updateStatus
  );

  // Toast wrapper functions for operations
  const handleRefreshOperationWithToast = async (operationName: string) => {
    showToast({
      title: `Starting ${operationName} refresh...`,
      description: "Refreshing cache data. This may take a moment.",
      variant: "default",
    });

    const result = await handleRefreshOperation(operationName);

    if (result.success) {
      showToast({
        title: `${operationName} refreshed successfully!`,
        description: "Cache data has been updated.",
        variant: "success",
      });
    } else {
      showToast({
        title: "Failed to refresh operation",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleClearOperationWithToast = async (operationName: string) => {
    showToast({
      title: `Starting ${operationName} cache clear...`,
      description: "Clearing cache data. This may take a moment.",
      variant: "default",
    });

    const result = await handleClearOperation(operationName);

    if (result.success) {
      showToast({
        title: `${operationName} cache cleared successfully!`,
        description: "Cache data has been cleared.",
        variant: "success",
      });
    } else {
      showToast({
        title: "Failed to clear operation cache",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  // Toast wrapper functions for global operations
  const handleRefreshAllWithToast = async () => {
    showToast({
      title: "Starting cache refresh...",
      description: "Refreshing all caches. This may take a moment.",
      variant: "default",
    });

    const result = await handleRefreshAll();

    if (result.success) {
      showToast({
        title: "All caches refreshed successfully!",
        description: "Cache data has been updated.",
        variant: "success",
      });
    } else {
      showToast({
        title: "Failed to refresh caches",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleClearAllCacheWithToast = async () => {
    showToast({
      title: "Starting cache clear...",
      description: "Clearing all caches. This may take a moment.",
      variant: "default",
    });

    const result = await handleClearAllCache();

    if (result.success) {
      showToast({
        title: "All caches cleared successfully!",
        description: "Cache data has been cleared.",
        variant: "success",
      });
    } else {
      showToast({
        title: "Failed to clear caches",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleSaveConfigurationWithToast = async () => {
    const result = await handleSaveConfiguration();

    if (result.success) {
      showToast({
        title: "Cache configuration saved successfully!",
        description:
          "Configuration has been updated and scheduled refresh restarted.",
        variant: "success",
      });
    } else {
      showToast({
        title: "Failed to save configuration",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  // Get cache status response
  const cacheStatusResponse = getCacheStatusResponse(
    operationCacheStatus,
    cacheConfig.enableCaching
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CacheManagementHeader
        onRefreshAll={handleRefreshAllWithToast}
        onClearAllCache={handleClearAllCacheWithToast}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Configuration */}
        <div className="space-y-6">
          <CacheConfigurationCard
            cacheConfig={cacheConfig}
            onConfigChange={setCacheConfigState}
            onSaveConfiguration={handleSaveConfigurationWithToast}
            hasChanges={hasChanges()}
            isSaving={isSaving}
          />
        </div>

        {/* Right Panel: Cache Status */}
        <div className="space-y-6">
          <CacheStatusCard
            cacheStatus={cacheStatusResponse}
            scheduledInfo={scheduledInfo}
            onRefreshOperation={handleRefreshOperationWithToast}
            onRefreshServiceGroup={handleRefreshServiceGroupWithToast}
            onClearOperation={handleClearOperationWithToast}
            onClearServiceGroup={handleClearServiceGroupWithToast}
            onViewContents={handleViewContents}
            serviceGroups={SERVICE_GROUPS}
          />
        </div>
      </div>

      {/* Cache Contents Viewer */}
      {selectedOperation && (
        <CacheContentsViewer
          operation={selectedOperation}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onRefreshOperation={handleRefreshOperationWithToast}
        />
      )}
    </div>
  );
}
