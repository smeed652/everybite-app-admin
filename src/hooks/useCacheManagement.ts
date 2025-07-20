import { useCacheConfiguration } from "./useCacheConfiguration";
import { useCacheOperations } from "./useCacheOperations";
import { useCacheUIState } from "./useCacheUIState";

export function useCacheManagement() {
  const {
    cacheConfig,
    originalConfig,
    isSaving,
    setCacheConfigState,
    hasChanges,
    handleSaveConfiguration,
  } = useCacheConfiguration();

  const {
    operationCacheStatus,
    scheduledInfo,
    updateStatus,
    handleRefreshAll,
    handleClearAllCache,
    handleRefreshOperation,
    handleClearOperation,
  } = useCacheOperations();

  const {
    selectedOperation,
    isViewerOpen,
    setSelectedOperation,
    setIsViewerOpen,
    handleViewContents,
    handleCloseViewer,
  } = useCacheUIState();

  return {
    // State
    operationCacheStatus,
    scheduledInfo,
    isSaving,
    selectedOperation,
    isViewerOpen,
    cacheConfig,
    originalConfig,

    // Actions
    setCacheConfigState,
    setSelectedOperation,
    setIsViewerOpen,
    hasChanges,
    updateStatus,
    handleRefreshAll,
    handleClearAllCache,
    handleRefreshOperation,
    handleClearOperation,
    handleSaveConfiguration,
    handleViewContents,
    handleCloseViewer,
  };
}
