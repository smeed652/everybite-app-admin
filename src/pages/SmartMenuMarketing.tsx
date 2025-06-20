import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import SmartMenuHeader from '../features/smartMenus/components/SmartMenuHeader';
import { useWidget } from '../features/smartMenus/hooks/useWidget';
import { useUpdateWidget } from '../features/smartMenus/hooks/useUpdateWidget';
import { Widget } from '../generated/graphql';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

import MarketingPanel from '../features/smartMenus/components/MarketingPanel';

export default function SmartMenuMarketing() {
  const { widgetId } = useParams<{ widgetId: string }>();
  const navigate = useNavigate();
  const { widget, loading, error } = useWidget(widgetId || '');
  const { updateWidgetFields } = useUpdateWidget();
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});
  // clear pending changes whenever a new widget is loaded
  useEffect(() => setPendingChanges({}), [widget?.id]);
  const dirty = Object.keys(pendingChanges).length > 0;

  const handleFieldChange = (changes: Record<string, unknown>) => {
    if (!widget) return;
    setPendingChanges(prev => {
      const next = { ...prev };
      Object.entries(changes).forEach(([k, v]) => {
        // treat undefined original as false
        const original = (widget as Widget)[k as keyof Widget] ?? false;
        if (v === original) {
          delete next[k];
        } else {
          next[k] = v;
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!widget?.id || !dirty) return;
    setSaving(true);
    await updateWidgetFields(widget.id, pendingChanges as Partial<Widget>);
    setSaving(false);
    toast.success('Widget saved successfully');
    setPendingChanges({});
  };

  const handleCancel = () => window.location.reload();

  if (error) return <p className="text-red-600">Error loading widget.</p>;

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen px-6 py-6" data-testid="smartmenu-marketing">
      {widget && (
        <SmartMenuHeader
          widget={widget}
          dirty={dirty}
          saving={saving}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={() => navigate(`/smart-menus/${widgetId}?mode=preview`)}
        />
      )}

      {loading || !widget ? (
        <Card className="p-6 space-y-2 max-w-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </Card>
      ) : (
        <MarketingPanel widget={widget} onFieldChange={handleFieldChange} />
      )}
    </div>
  );
}
