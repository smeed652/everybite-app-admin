import { CacheOperation } from "../../types/cache";
import { CacheServiceGroup } from "./CacheServiceGroup";
import { SERVICE_GROUPS } from "./constants";
import { CacheConfigurationCard, CacheStatusCard } from "./index";

interface CacheManagementLayoutProps {
  // Configuration panel props
  cacheConfig: any;
  setCacheConfigState: (config: any) => void;
  handleSaveConfiguration: () => void;
  hasChanges: boolean;
  isSaving: boolean;

  // Status panel props
  cacheStatus: any;
  scheduledInfo: any;
  handleRefreshOperation: (operationName: string) => void;
  handleRefreshServiceGroup: (groupName: string) => void;
  handleClearOperation: (operationName: string) => void;
  handleClearServiceGroup: (groupName: string) => void;
  handleViewContents: (operation: CacheOperation) => void;

  // Viewer props
  selectedOperation: CacheOperation | null;
  isViewerOpen: boolean;
  handleCloseViewer: () => void;
}

export function CacheManagementLayout({
  // Configuration panel props
  cacheConfig,
  setCacheConfigState,
  handleSaveConfiguration,
  hasChanges,
  isSaving,

  // Status panel props
  cacheStatus,
  scheduledInfo,
  handleRefreshOperation,
  handleRefreshServiceGroup,
  handleClearOperation,
  handleClearServiceGroup,
  handleViewContents,

  // Viewer props
  selectedOperation,
  isViewerOpen,
  handleCloseViewer,
}: CacheManagementLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel: Configuration */}
      <div className="space-y-6">
        <CacheConfigurationCard
          cacheConfig={cacheConfig}
          onConfigChange={setCacheConfigState}
          onSaveConfiguration={handleSaveConfiguration}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />
      </div>

      {/* Right Panel: Cache Status */}
      <div className="space-y-6">
        <CacheStatusCard
          cacheStatus={cacheStatus}
          scheduledInfo={scheduledInfo}
          onRefreshOperation={handleRefreshOperation}
          onRefreshServiceGroup={handleRefreshServiceGroup}
          onClearOperation={handleClearOperation}
          onClearServiceGroup={handleClearServiceGroup}
          onViewContents={handleViewContents}
          serviceGroups={SERVICE_GROUPS}
        />

        {/* Service Groups */}
        <div className="space-y-6">
          {SERVICE_GROUPS.map((serviceGroup) => (
            <CacheServiceGroup
              key={serviceGroup.name}
              serviceGroup={serviceGroup}
              cacheStatus={cacheStatus.data}
              onRefreshGroup={handleRefreshServiceGroup}
              onClearGroup={handleClearServiceGroup}
              onRefreshOperation={handleRefreshOperation}
              onClearOperation={handleClearOperation}
              onViewContents={handleViewContents}
            />
          ))}
        </div>
      </div>

      {/* Cache Contents Viewer */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* This would be replaced with the actual CacheContentsViewer component */}
          <div className="bg-white rounded-lg p-6">
            <h3>Cache Contents Viewer</h3>
            <p>Operation: {selectedOperation.operation}</p>
            <button onClick={handleCloseViewer}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
