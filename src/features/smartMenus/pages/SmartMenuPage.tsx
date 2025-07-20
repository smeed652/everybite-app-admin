import { ReactNode } from "react";
import { useParams } from "react-router-dom";

import { RefreshCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { Widget } from "../../../generated/graphql";
import { SmartMenuErrorState } from "../components/SmartMenuErrorState";
import SmartMenuHeader from "../components/SmartMenuHeader";
import { SmartMenuLoadingState } from "../components/SmartMenuLoadingState";
import {
  useSmartMenuActions,
  type SmartMenuSaveArgs,
} from "../hooks/useSmartMenuActions";
import { useWidget } from "../hooks/useWidget";
import { useWidgetDiff } from "../hooks/useWidgetDiff";

interface Props {
  widgetId?: string;
  renderPanels: (
    widget: Widget,
    formKey: number,
    onFieldChange: (changes: Partial<Widget>) => void
  ) => ReactNode;
  onSave?: (args: SmartMenuSaveArgs) => Promise<void>;
}

export default function SmartMenuPage({
  widgetId,
  renderPanels,
  onSave,
}: Props) {
  const params = useParams();
  const id = widgetId ?? (params.widgetId as string);

  console.log("[SmartMenuPage] Widget ID:", id);
  console.log("[SmartMenuPage] Params:", params);

  const { widget, loading, error, refetch } = useWidget(id);

  console.log("[SmartMenuPage] Loading:", loading);
  console.log("[SmartMenuPage] Error:", error);
  console.log("[SmartMenuPage] Widget:", widget);

  // Always call hooks at the top level with proper fallbacks
  const {
    formKey,
    dirty,
    pendingChanges,
    handleFieldChange,
    reset,
    refreshSnapshot,
  } = useWidgetDiff(widget ?? null);

  const {
    saving,
    syncing,
    handleSave: originalHandleSave,
    handleCancel,
    handleSyncNow,
  } = useSmartMenuActions({
    widget: widget ?? ({} as Widget), // Provide a fallback to satisfy the hook
    dirty,
    pendingChanges,
    refreshSnapshot,
    reset,
    onSave,
  });

  // Custom save handler that refetches data after successful save
  const handleSave = async () => {
    if (!dirty || !widget?.id) return;
    try {
      await originalHandleSave();
      // Refetch data from server after successful save
      await refetch();
    } catch (error) {
      // Error handling is already done in originalHandleSave
      console.error("Save failed:", error);
    }
  };

  /* ---------- loading / error ---------- */
  if (loading) {
    return <SmartMenuLoadingState />;
  }
  if (error || !widget) {
    return <SmartMenuErrorState error={error} />;
  }

  /* ---------- render ---------- */
  return (
    // this wrapper becomes the single flex item inside <AppContent>
    <div
      className="flex flex-col flex-1 overflow-hidden"
      data-testid="smartmenu-generic-page"
    >
      {/* fixed (non-scrolling) header */}
      <SmartMenuHeader
        widget={widget}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
        extraActions={
          <Button variant="outline" onClick={handleSyncNow} disabled={syncing}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Sync Now
          </Button>
        }
      />

      {/* scrollable page body */}
      <div className="flex-1 overflow-y-auto space-y-6 p-8">
        {renderPanels(widget, formKey, handleFieldChange)}
      </div>
    </div>
  );
}
