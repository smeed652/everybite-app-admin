import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  // key to force remount on cancel
  const [formKey, setFormKey] = useState(0);
  // snapshot original widget once per widget id
  const originalRef = useRef<Widget | null>(widget ?? null);
  useEffect(() => {
    if (widget && widget.id !== originalRef.current?.id) {
      originalRef.current = widget;
      setPendingChanges({});
    }
  }, [widget]);
  const dirty = Object.keys(pendingChanges).length > 0;

  const handleFieldChange = (changes: Record<string, unknown>) => {
    if (!widget) return;
    setPendingChanges(prev => {
      const next = { ...prev };
      Object.entries(changes).forEach(([k, v]) => {
        let original: unknown = originalRef.current ? (originalRef.current as Record<string, unknown>)[k] : undefined;
        if (original === undefined) {
          const newVal = v;
          if (typeof newVal === 'boolean') original = false;
          else if (typeof newVal === 'number') original = 0;
          else if (typeof newVal === 'string') original = '';
        }
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

  const handleCancel = () => {
    setPendingChanges({});
    setFormKey((k) => k + 1);
  };

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
        <MarketingPanel key={`marketing-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
      )}
    </div>
  );
}
