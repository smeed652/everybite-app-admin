import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { Input } from '../../../components/ui/Input';
import { ShoppingCart } from 'lucide-react';

interface Props {
  enableOrdering: boolean;
  onToggleOrdering: (v: boolean) => void;
  baseUrl: string;
  onBaseUrlChange: (v: string) => void;
  utmTags: string;
  onUtmTagsChange: (v: string) => void;
}

/**
 * Ordering controls (toggle + URL fields) grouped in one Card.
 */
export default function OrderingSection({
  enableOrdering,
  onToggleOrdering,
  baseUrl,
  onBaseUrlChange,
  utmTags,
  onUtmTagsChange,
}: Props) {
  const fullUrl = enableOrdering && baseUrl ? `${baseUrl}${utmTags ? `?${utmTags}` : ''}` : '';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="h-4 w-4" /> Ordering
          </p>
          <p className="text-sm text-muted-foreground">
            Configure the order-button link &amp; UTM tags
          </p>
        </div>
        <Toggle checked={enableOrdering} onChange={onToggleOrdering} />
      </div>

      {enableOrdering && (
        <div className="space-y-3 pl-6">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="base-url">
              Base&nbsp;URL
            </label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => onBaseUrlChange(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="utm-tags">
              UTM&nbsp;Tags
            </label>
            <Input
              id="utm-tags"
              value={utmTags}
              onChange={(e) => onUtmTagsChange(e.target.value)}
              placeholder="utm_source=...&utm_medium=..."
            />
          </div>
          <p className="text-sm break-all bg-gray-50 border rounded px-2 py-1">
            {fullUrl || '—'}
          </p>
        </div>
      )}
    </Card>
  );
}
