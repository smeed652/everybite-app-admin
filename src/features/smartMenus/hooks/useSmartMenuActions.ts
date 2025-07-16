import { useState } from "react";
import { useToast } from "../../../components/ui/ToastProvider";
import type { Widget } from "../../../generated/graphql";
import { useSyncWidget } from "./useSyncWidget";
import { useUpdateWidget } from "./useUpdateWidget";

export interface SmartMenuSaveArgs {
  widget: Widget;
  pendingChanges: Record<string, unknown>;
  updateFields: (changes: Partial<Widget>) => Promise<void>;
}

interface UseSmartMenuActionsProps {
  widget: Widget;
  dirty: boolean;
  pendingChanges: Record<string, unknown>;
  refreshSnapshot: () => void;
  reset: () => void;
  onSave?: (args: SmartMenuSaveArgs) => Promise<void>;
}

export function useSmartMenuActions({
  widget,
  dirty,
  pendingChanges,
  refreshSnapshot,
  reset,
  onSave,
}: UseSmartMenuActionsProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const { sync, loading: syncing } = useSyncWidget();
  const { updateWidgetFields } = useUpdateWidget();

  const handleSave = async () => {
    if (!dirty || !widget?.id) return;
    setSaving(true);
    try {
      if (onSave) {
        await onSave({
          widget,
          pendingChanges,
          updateFields: async (changes) => {
            await updateWidgetFields(widget.id, changes);
          },
        });
      } else {
        await updateWidgetFields(widget.id, pendingChanges as Partial<Widget>);
      }
      showToast({ title: "Changes saved", variant: "success" });
      refreshSnapshot();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    // No page reload needed - reset() already clears pendingChanges and increments formKey
    // which forces child panels to remount with pristine props
  };

  const handleSyncNow = async () => {
    if (!widget?.id) return;
    try {
      await sync(widget.id);
      showToast({ title: "Sync started", variant: "success" });
    } catch {
      showToast({ title: "Sync failed", variant: "error" });
    }
  };

  return {
    saving,
    syncing,
    handleSave,
    handleCancel,
    handleSyncNow,
  };
}
