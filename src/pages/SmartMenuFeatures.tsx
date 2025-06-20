import { useState, useEffect } from 'react';
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
  // clear pending when new widget arrives
  useEffect(() => setPending({}), [widget?.id]);
  const dirty = Object.keys(pending).length > 0;

  /* --------------------------- handlers --------------------------- */

  const handleFieldChange = (changes: Record<string, unknown>) => {
    if (!widget) return;
    setPending((prev) => {
      const next = { ...prev };
      Object.entries(changes).forEach(([k, v]) => {
        // @ts-expect-error – widget fields are dynamic
        const original = widget[k];
        if (JSON.stringify(original) === JSON.stringify(v)) {
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
    await updateWidgetFields(widget.id, pending as Partial<Widget>);
    setSaving(false);
    toast.success('Widget saved successfully');
    setPending({});
  };

  const handleCancel = () => window.location.reload();

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
        <FeaturesPanel widget={widget} onFieldChange={handleFieldChange} />
      )}
    </div>
  );
}