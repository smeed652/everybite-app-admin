import { ReactNode } from 'react';
import type { Widget } from '../../../generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Eye } from 'lucide-react';
import ResourceHeader from '../../../components/ResourceHeader';

interface Props {
  widget: Widget & { lastSyncedAt?: string | null };
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  extraActions?: ReactNode;
  /** Override heading level for the widget name heading (1–6). Defaults to 2 when unspecified */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function SmartMenuHeader({
  widget,
  dirty = false,
  saving = false,
  onSave,
  onCancel,
  onPreview,
  extraActions,
  headingLevel = 2,
}: Props) {
  /* ---------- actions ---------- */
  const actions = (
    <>
      {extraActions}

      <Button
        variant="outline"
        type="button"
        className="mr-4"
        onClick={
          onPreview ??
          (() => window.open(`https://app.everybite.com/widget/${widget.id}`, '_blank'))
        }
      >
        <Eye aria-hidden="true" className="h-4 w-4 mr-2" /> Preview Widget
      </Button>

      {onCancel && (
        <Button variant="outline" onClick={onCancel} disabled={!dirty || saving} type="button">
          Cancel
        </Button>
      )}

      {onSave && (
        <Button onClick={onSave} disabled={!dirty || saving} type="button">
          Save
        </Button>
      )}
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
    {
      label: 'Last Synced',
      value: widget.lastSyncedAt ? new Date(widget.lastSyncedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—',
    },
    { label: 'SmartMenu ID', value: widget.id },
    { label: 'Slug', value: widget.slug || '—' },
    {
      label: 'Status',
      value: widget.isActive ? (
        <span className="inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-xs text-green-900">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
          Inactive
        </span>
      ),
    },
  ];

  /* ---------- title (includes breadcrumb) ---------- */
  const title = (
    <div>
      <span className="text-3xl font-semibold break-words max-w-full">{widget.name}</span>
    </div>
  );

  return <ResourceHeader title={title} meta={meta} actions={actions} level={headingLevel} />;
}

export { SmartMenuHeader };
