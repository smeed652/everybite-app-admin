import { useState } from "react";
import { CacheOperation } from "../types/cache";

export function useCacheUIState() {
  // Cache contents viewer state
  const [selectedOperation, setSelectedOperation] =
    useState<CacheOperation | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleViewContents = (operation: CacheOperation) => {
    setSelectedOperation(operation);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedOperation(null);
  };

  return {
    selectedOperation,
    isViewerOpen,
    setSelectedOperation,
    setIsViewerOpen,
    handleViewContents,
    handleCloseViewer,
  };
}
