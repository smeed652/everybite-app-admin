import { ReactNode } from 'react';
import type { Widget } from '../../../generated/graphql';
import { Button } from '../../../components/ui/Button';
import ResourceHeader from '../../../components/ResourceHeader';

interface Props {
  widget: Widget;
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  extraActions?: ReactNode;
}

export default function SmartMenuHeader({
  widget,
  dirty = false,
  saving = false,
  onSave,
  onCancel,
  onPreview,
  extraActions,
}: Props) {
  /* ---------- actions ---------- */
  const actions = (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={
          onPreview ??
          (() => window.open(`https://app.everybite.com/widget/${widget.id}`, '_blank'))
        }
      >
        Preview Widget
      </Button>

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
    </>
  );

  /* ---------- meta grid ---------- */
  const meta = [
    {
      label: 'Last Edited',
      value: widget.updatedAt ? new Date(widget.updatedAt).toLocaleDateString() : '—',
    },
    {
      label: 'Production Date',
      value: widget.publishedAt ? new Date(widget.publishedAt).toLocaleDateString() : '—',
    },
    { label: 'SmartMenu ID', value: widget.id },
    { label: 'Slug', value: widget.slug || '—' },
    {
      label: 'Status',
      value: widget.isActive ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
          Inactive
        </span>
      ),
    },
  ];

  /* ---------- title (includes breadcrumb) ---------- */
  const title = (
    <div>
      <nav className="text-sm text-gray-600 mb-1">Edit Widget</nav>
      <span className="text-3xl font-semibold break-words max-w-full">{widget.name}</span>
    </div>
  );

  return <ResourceHeader title={title} meta={meta} actions={actions} />;
}