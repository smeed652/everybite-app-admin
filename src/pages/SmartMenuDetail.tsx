import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
  const { updateWidgetFields, loading: saving } = useUpdateWidget();
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});
  const dirty = Object.keys(pendingChanges).length > 0;
  

  const handleFieldChange = (changes: Record<string, unknown>) => {
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  const handleSave = async () => {
    if (!widget?.id || !dirty) return;
    await updateWidgetFields(widget.id, pendingChanges as Partial<Widget>);
    toast.success('Widget saved successfully');
    setPendingChanges({});
  };

  const handleCancel = () => {
    window.location.reload();
  };

  if (error) return <p className="text-red-600">Error loading widget.</p>;

  return (
    <div className="space-y-4" data-testid="smartmenu-detail">
      
        {widget && (
        <header className="space-y-4" data-testid="smartmenu-header">
          <div className="flex justify-between items-start">
            <div>
              <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                
                <span>/</span>
                <span>Edit Widget</span>
              </nav>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                {widget.name}
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Preview Widget</Button>
              {dirty && (
                <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
              )}
              <Button onClick={handleSave} disabled={!dirty || saving}>Save</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 border-t pt-4">
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Last Edited</h4>
              <p className="text-sm">{widget.updatedAt ? new Date(widget.updatedAt).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Production Date</h4>
              <p className="text-sm">{widget.publishedAt ? new Date(widget.publishedAt).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              {widget.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Active</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">Inactive</span>
            )}
            </div>
            
          </div>
        </header>
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


        {widget && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Ordering</h3>
            <Card className="p-4 space-y-2">
              <div><span className="font-medium">Order URL:</span> <a href={widget.orderUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{widget.orderUrl}</a></div>
              <div><span className="font-medium">Ordering Enabled:</span> {widget.isOrderButtonEnabled ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">UTM present:</span> {/[?&]utm_/.test(widget.orderUrl ?? '') ? 'Yes' : 'No'}</div>
            </Card>
          </section>
        )}
      <Button variant="outline" onClick={() => navigate('/smart-menus')}>Back to list</Button>
    </div>
  );
}
