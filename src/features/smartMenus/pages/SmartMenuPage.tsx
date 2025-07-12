import { ReactNode, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import type { Widget } from '../../../generated/graphql';
import { useWidget } from '../hooks/useWidget';
import { useWidgetDiff } from '../hooks/useWidgetDiff';
import { useUpdateWidget } from '../hooks/useUpdateWidget';
import SmartMenuHeader from '../components/SmartMenuHeader';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';

export interface SmartMenuSaveArgs {
  widget: Widget;
  pendingChanges: Record<string, unknown>;
  updateFields: (changes: Partial<Widget>) => Promise<void>;
}

interface Props {
  widgetId?: string;
  renderPanels: (
    widget: Widget,
    formKey: number,
    onFieldChange: (changes: Partial<Widget>) => void,
  ) => ReactNode;
  onSave?: (args: SmartMenuSaveArgs) => Promise<void>;
}

export default function SmartMenuPage({ widgetId, renderPanels, onSave }: Props) {
  const navigate = useNavigate();
  const params   = useParams();
  const id       = widgetId ?? (params.widgetId as string);

  const { widget, loading, error }   = useWidget(id);
  const { updateWidgetFields }       = useUpdateWidget();
  const {
    formKey,
    dirty,
    pendingChanges,
    handleFieldChange,
    reset,
    refreshSnapshot,
  } = useWidgetDiff(widget ?? null);

  const [saving, setSaving] = useState(false);

  /* ---------- loading / error ---------- */
  if (loading) {
    return (
      <div className="p-8 space-y-4" data-testid="smartmenu-generic-page">
        <Skeleton className="h-8 w-1/3" />
        <Card className="h-64" />
      </div>
    );
  }
  if (error || !widget) return <div className="text-red-600">Failed to load widget.</div>;

  /* ---------- actions ---------- */
  const handleSave = async () => {
    if (!dirty) return;
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
      toast.success('Changes saved');
      refreshSnapshot();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    navigate(0);
  };

  /* ---------- render ---------- */
return (
  // this wrapper becomes the single flex item inside <AppContent>
  <div className="flex flex-col flex-1 overflow-hidden" data-testid="smartmenu-generic-page">
    {/* fixed (non-scrolling) header */}
    <SmartMenuHeader
      widget={widget}
      dirty={dirty}
      saving={saving}
      onSave={handleSave}
      onCancel={handleCancel}
    />

    {/* scrollable page body */}
    <div className="flex-1 overflow-y-auto space-y-6 p-8">
      {renderPanels(widget, formKey, handleFieldChange)}
    </div>
  </div>
);
}