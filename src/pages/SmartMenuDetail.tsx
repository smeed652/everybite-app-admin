import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import SmartMenuHeader from '../features/smartMenus/components/SmartMenuHeader';
import { Widget } from '../generated/graphql';
import { useWidget } from '../features/smartMenus/hooks/useWidget';
import { useUpdateWidget } from '../features/smartMenus/hooks/useUpdateWidget';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import BasicPanel from '../features/smartMenus/components/BasicPanel';
import DesignPanel from '../features/smartMenus/components/DesignPanel';
import BrandingPanel from '../features/smartMenus/components/BrandingPanel';
import { toast } from 'react-hot-toast';

export default function SmartMenuDetail() {
  const navigate = useNavigate();
  const { widgetId } = useParams<{ widgetId: string }>();
  const { widget, loading, error } = useWidget(widgetId || '');
  const { updateWidgetFields } = useUpdateWidget();

  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  const dirty = Object.keys(pendingChanges).length > 0;

  // helpers -------------------------------------------------
  const handleFieldChange = (changes: Record<string, unknown>) =>
    setPendingChanges((prev) => ({ ...prev, ...changes }));

  const handleSave = async () => {
    if (!widget?.id || !dirty) return;
    setSaving(true);
    await updateWidgetFields(widget.id, pendingChanges as Partial<Widget>);
    setSaving(false);
    toast.success('Widget saved successfully');
    setPendingChanges({});
  };

  const handleCancel = () => window.location.reload();
  // --------------------------------------------------------

  if (error) return <p className="text-red-600">Error loading widget.</p>;

  return (
    <div
      className="space-y-4 bg-gray-50 min-h-screen px-6 py-6"
      data-testid="smartmenu-detail"
    >
      {widget && (
        <SmartMenuHeader
          widget={widget}
          dirty={dirty}
          saving={saving}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={() => window.open(`https://app.everybite.com/widget/${widget.id}`, '_blank')}
        />
      )}

      {loading || !widget ? (
        <Card className="p-6 space-y-2 max-w-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </Card>
      ) : (
        <>
          <BasicPanel widget={widget} onFieldChange={handleFieldChange} />
          <DesignPanel widget={widget} onFieldChange={handleFieldChange} />
          <BrandingPanel widget={widget} onFieldChange={handleFieldChange} />
        </>
      )}



      <Button variant="outline" onClick={() => navigate('/smart-menus')}>
        Back to list
      </Button>
    </div>
  );
}