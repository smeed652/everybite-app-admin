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
  // remount helper to reset all child panel states on cancel
  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();
  const { widgetId } = useParams<{ widgetId: string }>();
  const { widget, loading, error } = useWidget(widgetId || '');
  const { updateWidgetFields } = useUpdateWidget();
  const { toggleWidgetSync } = useToggleWidgetSync();

  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  const dirty = Object.keys(pendingChanges).length > 0;

  // helpers -------------------------------------------------
  const originalRef = useRef<Widget | null>(widget ?? null);

  // whenever widget id changes, reset snapshot
  useEffect(() => {
    if (widget && widget.id !== originalRef.current?.id) {
      originalRef.current = widget;
    }
  }, [widget]);

  const handleFieldChange = (changes: Record<string, unknown>) =>
    setPendingChanges((prev) => {
      const next = { ...prev, ...changes };
      // remove keys that match original widget values to avoid false dirty state
      Object.keys(next).forEach((k) => {
        let originalVal: unknown = originalRef.current ? (originalRef.current as Record<string, unknown>)[k] : undefined;
        // coerce undefined to sensible falsy defaults so "undefined" vs false doesn't count as dirty
        if (originalVal === undefined) {
          const newVal = next[k];
          if (typeof newVal === 'boolean') originalVal = false;
          else if (typeof newVal === 'number') originalVal = 0;
          else if (typeof newVal === 'string') originalVal = '';
        }
        if (JSON.stringify(next[k]) === JSON.stringify(originalVal)) {
          delete next[k];
        }
      });
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_LOG_LEVEL === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[Detail] diff incoming', changes, 'pending next:', next);
      }
      return next;
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

  const handleCancel = () => {
    setPendingChanges({});
    // bump key so all panels remount with original widget props
    setFormKey((k) => k + 1);
  };
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
          {/* key forces remount on soft reset */}
          <BasicPanel key={`basic-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
          <SyncPanel key={`sync-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
          <DesignPanel key={`design-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
          <FooterPanel key={`footer-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
          <BrandingPanel key={`branding-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
          <HostedPageBrandingPanel key={`hp-brand-${formKey}`} widget={widget} onFieldChange={handleFieldChange} />
        </>
      )}



      <Button variant="outline" onClick={() => navigate('/smart-menus')}>
        Back to list
      </Button>
    </div>
  );
}