import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
import HostedPageBrandingPanel from '../features/smartMenus/components/HostedPageBrandingPanel';
import SyncPanel from '../features/smartMenus/components/SyncPanel';
import FooterPanel from '../features/smartMenus/components/FooterPanel';
import { toast } from 'react-hot-toast';
import { useToggleWidgetSync } from '../features/smartMenus/hooks/useToggleWidgetSync';

export default function SmartMenuDetail() {
  const navigate = useNavigate();
  const { widgetId } = useParams<{ widgetId: string }>();
  const { widget, loading, error } = useWidget(widgetId || '');
  const { updateWidgetFields } = useUpdateWidget();
  const { toggleWidgetSync } = useToggleWidgetSync();

  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  const dirty = Object.keys(pendingChanges).length > 0;

  // helpers -------------------------------------------------
  const originalRef = useRef<Widget | null>(null);

  // store first-loaded widget snapshot to compare against
  useEffect(() => {
    if (widget) originalRef.current = widget;
  }, [widget]);

  const handleFieldChange = (changes: Record<string, unknown>) =>
    setPendingChanges((prev) => {
      const merged = { ...prev, ...changes };
      // remove any keys that match original widget value to avoid false dirty state
      Object.keys(merged).forEach((k) => {
        // compare by JSON value to avoid type (number vs string) discrepancies
        const originalVal = originalRef.current ? (originalRef.current as Record<string, unknown>)[k] : undefined;
        if (JSON.stringify(merged[k]) === JSON.stringify(originalVal)) {
          delete merged[k];
        }
      });
      return merged;
    });

  const handleSave = async () => {
    if (!widget?.id || !dirty) return;
    setSaving(true);
    // separate sync diff from others because API uses dedicated mutation
  const { isSyncEnabled, ...other } = pendingChanges as Record<string, unknown>;
  if (Object.keys(other).length) {
    await updateWidgetFields(widget.id, other as Partial<Widget>);
  }
  if (isSyncEnabled !== undefined && isSyncEnabled !== widget.isSyncEnabled) {
    await toggleWidgetSync(widget.id, isSyncEnabled as boolean);
  }
    // update local snapshot so future comparisons are correct
    if (originalRef.current) {
      originalRef.current = {
        ...originalRef.current,
        ...other,
      ...(isSyncEnabled !== undefined ? { isSyncEnabled } : {}),
      } as Widget;
    }
    setSaving(false);
    toast.success('SmartMenu saved successfully');
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
          <SyncPanel widget={widget} onFieldChange={handleFieldChange} />
          <DesignPanel widget={widget} onFieldChange={handleFieldChange} />
          <FooterPanel widget={widget} onFieldChange={handleFieldChange} />
          <BrandingPanel widget={widget} onFieldChange={handleFieldChange} />
          <HostedPageBrandingPanel widget={widget} onFieldChange={handleFieldChange} />
        </>
      )}



      <Button variant="outline" onClick={() => navigate('/smart-menus')}>
        Back to list
      </Button>
    </div>
  );
}