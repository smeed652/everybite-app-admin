import { useParams, Link } from 'react-router-dom';
import { useWidget } from '../features/smartMenus/hooks/useWidget';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

export default function SmartMenuDetail() {
  const { widgetId } = useParams<{ widgetId: string }>();
  const { widget, loading, error } = useWidget(widgetId || '');

  if (error) return <p className="text-red-600">Error loading widget.</p>;

  return (
    <div className="space-y-4" data-testid="smartmenu-detail">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/smart-menus" className="hover:underline">SmartMenus</Link>
        <span>/</span>
        <span>{widget?.name || '...'}</span>
      </div>
      <h2 className="text-2xl font-semibold">SmartMenu Details</h2>

      {loading || !widget ? (
        <Card className="p-6 space-y-2 max-w-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </Card>
      ) : (
        <Card className="p-6 space-y-2 max-w-md">
          <div><span className="font-medium">Name:</span> {widget.name}</div>
          <div><span className="font-medium">Slug:</span> {widget.slug}</div>
          <div><span className="font-medium">Layout:</span> {widget.layout}</div>
          <div><span className="font-medium">Images:</span> {widget.displayImages ? 'Enabled' : 'Disabled'}</div>
          <div><span className="font-medium">Ordering:</span> {widget.isOrderButtonEnabled ? 'Enabled' : 'Disabled'}</div>
          <div><span className="font-medium">Primary Color:</span> <span style={{ background: widget.primaryBrandColor }} className="inline-block w-4 h-4 align-middle rounded" /></div>
        </Card>
      )}

      {/* Placeholder for future editable tabs */}
      <Button variant="outline" asChild>
        <Link to="/smart-menus">Back to list</Link>
      </Button>
    </div>
  );
}
