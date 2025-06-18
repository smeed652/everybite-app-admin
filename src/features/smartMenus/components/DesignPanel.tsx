import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Layout, Widget } from '../../../generated/graphql';
import CardLayoutImg from '../../../assets/CardLayoutIcon.png';
import TableLayoutImg from '../../../assets/TableLayoutIcon.png';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function DesignPanel({ widget, onFieldChange }: Props) {
  const [layout, setLayout] = useState<Layout>(widget.layout);
  const [images, setImages] = useState<boolean>(widget.displayImages);
  const [loading] = useState(false);

  // emit changes upward
  useEffect(() => {
    const changes: Partial<Widget> = {};
    if (layout !== widget.layout) changes.layout = layout;
    if (images !== widget.displayImages) changes.displayImages = images;
    if (Object.keys(changes).length) onFieldChange(changes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, images]);

  return (
    <section className="space-y-6" data-testid="design-panel">
      <h3 className="text-lg font-semibold">Design</h3>

      {/* Template selector */}
      <Card className="p-4 space-y-4">
        <p className="text-sm font-medium">Template</p>
        <div className="flex gap-6">
          <LayoutOption
            label="Table Layout"
            imgSrc={TableLayoutImg}
            selected={layout === Layout.Table}
            onClick={() => setLayout(Layout.Table)}
          />
          <LayoutOption
            label="Card Layout"
            imgSrc={CardLayoutImg}
            selected={layout === Layout.Card}
            onClick={() => setLayout(Layout.Card)}
          />
        </div>
      </Card>

      {/* Images toggle */}
      <Card className="p-4 space-y-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Images</p>
          <p className="text-sm text-muted-foreground">Show images on dish cards and dish detail modals.</p>
        </div>
        <Toggle checked={images} onChange={setImages} disabled={loading} />
      </Card>
    </section>
  );
}

function LayoutOption({ label, imgSrc, selected, onClick }: { label: string; imgSrc: string; selected: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={`h-28 w-36 overflow-hidden relative border-2 ${selected ? 'border-primary' : 'border-muted'} rounded-sm` }
      onClick={onClick}
    >
      <img src={imgSrc} alt={label} className="object-cover h-full w-full" />
    </Button>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}
