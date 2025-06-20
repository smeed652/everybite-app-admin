import { Widget } from '../../../generated/graphql';
import { Button } from '../../../components/ui/Button';
import { ReactNode } from 'react';

interface Props {
  widget: Widget;
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  extraActions?: ReactNode;
}

/**
 * Reusable header shown on all SmartMenu sub-pages (Basics, Features, Marketing…).
 * Displays breadcrumb, widget name + id, quick stats row, and standard actions.
 */
export default function SmartMenuHeader({
  widget,
  dirty = false,
  saving = false,
  onSave,
  onCancel,
  onPreview,
  extraActions,
}: Props) {
  return (
    <header
      className="space-y-4 sticky top-0 z-10 bg-white shadow-lg ring-2 ring-gray-300 py-8 px-6"
      data-testid="smartmenu-header"
    >
      <div className="flex justify-between items-start">
        <div>
          <nav className="text-sm text-gray-600 mb-1">Edit Widget</nav>
          <h1 className="text-3xl font-semibold">
            {widget.name}{' '}
            <span className="ml-2 text-base font-normal text-gray-500">#{widget.id}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="outline" onClick={onPreview} type="button">
              Preview Widget
            </Button>
          )}
          {dirty && onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={saving} type="button">
              Cancel
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} disabled={!dirty || saving} type="button">
              Save
            </Button>
          )}
          {extraActions}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-8 border-t pt-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Last Edited</h4>
          <p className="text-sm">
            {widget.updatedAt ? new Date(widget.updatedAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Production Date</h4>
          <p className="text-sm">
            {widget.publishedAt ? new Date(widget.publishedAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Widget ID</h4>
          <p className="text-sm break-all">{widget.id}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Slug</h4>
          <p className="text-sm">{widget.slug || '—'}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
          {widget.isActive ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
              Inactive
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
