import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useWidget } from '../features/smartMenus/hooks/useWidget';
import { useUpdateWidget } from '../features/smartMenus/hooks/useUpdateWidget';
import { Widget } from '../generated/graphql';

import SmartMenuHeader from '../features/smartMenus/components/SmartMenuHeader';
import FeaturesPanel from '../features/smartMenus/components/FeaturesPanel';

import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';


export default function SmartMenuFeatures() {
  const { widgetId } = useParams<{ widgetId: string }>();
  const navigate = useNavigate();

  const { widget, loading, error } = useWidget(widgetId ?? '');
  const { updateWidgetFields } = useUpdateWidget();

  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Record<string, unknown>>({});
  // helper key to remount panel on cancel
  const [formKey, setFormKey] = useState(0);
  // snapshot original widget for stable comparisons
  const originalRef = useRef<Widget | null>(widget ?? null);
  // reset snapshot & pending when widget id changes
  useEffect(() => {
    if (widget && widget.id !== originalRef.current?.id) {
      originalRef.current = widget;
      setPending({});
    }
  }, [widget]);
  const dirty = Object.keys(pending).length > 0;

  /* --------------------------- handlers --------------------------- */

  const handleFieldChange = (changes: Record<string, unknown>) => {
    if (!widget) return;
    setPending((prev) => {
      const next = { ...prev };
      Object.entries(changes).forEach(([k, v]) => {
          let original: unknown = originalRef.current ? (originalRef.current as Record<string, unknown>)[k] : undefined;
        if (original === undefined) {
          const newVal = v;
          if (typeof newVal === 'boolean') original = false;
          else if (typeof newVal === 'number') original = 0;
          else if (typeof newVal === 'string') original = '';
        }
        if (JSON.stringify(original) === JSON.stringify(v)) {
          delete next[k];
        } else {
          next[k] = v;
        }
      });
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_LOG_LEVEL === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[Features] diff incoming', changes, 'pending next:', next);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!widget?.id || !dirty) return;
    setSaving(true);
    await updateWidgetFields(widget.id, pending as Partial<Widget>);
    setSaving(false);
    toast.success('Widget saved successfully');
    setPending({});
  };

  const handleCancel = () => {
    setPending({});
    setFormKey((k) => k + 1);
  };

  /* -------------------------- rendering -------------------------- */

  if (error) {
    return <p className="px-6 py-6 text-red-600">Error loading widget.</p>;
  }

  return (
    <div
      className="min-h-screen space-y-4 bg-gray-50 px-6 py-6"
      data-testid="smartmenu-features"
    >
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
        <Card className="max-w-md space-y-2 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </Card>
      ) : (
        <FeaturesPanel key={`features-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
      )}
    </div>
  );
}