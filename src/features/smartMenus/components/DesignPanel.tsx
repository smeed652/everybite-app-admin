import { useState, useEffect } from 'react';
import { Panel } from '../../../components/ui/Panel';
import FormSection from '../../../components/ui/FormSection';
import { Button } from '../../../components/ui/Button';
import { LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import type { Widget, Layout as GraphQLLayout } from '../../../generated/graphql';
// The GraphQL codegen enums are stripped at runtime in Vite, so we re-declare the
// two layout string literals we need locally. This keeps type-safety while
// removing the runtime dependency that caused "does not provide an export named 'Layout'".
type Layout = GraphQLLayout;
const LayoutValues = {
  Table: 'Table' as Layout,
  Card: 'Card' as Layout,
} as const;
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
    if (Object.keys(changes).length) {
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_LOG_LEVEL === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[DesignPanel] emit', changes);
      }
      onFieldChange(changes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, images]);

  return (
    <Panel title="Design" data-testid="design-panel">

      {/* Template selector */}
      <FormSection title={<span className="flex items-center gap-2"><LayoutDashboard aria-hidden="true" className="h-4 w-4" /> Template</span>}>
        <div className="flex gap-6">
          <LayoutOption
            label="Table"
            imgSrc={TableLayoutImg}
            selected={layout === LayoutValues.Table}
            onClick={() => setLayout(LayoutValues.Table)}
          />
          <LayoutOption
            label="Card"
            imgSrc={CardLayoutImg}
            selected={layout === LayoutValues.Card}
            onClick={() => setLayout(LayoutValues.Card)}
          />
        </div>
      </FormSection>

      {/* Images toggle */}
      <FormSection title="">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium"><ImageIcon aria-hidden="true" className="h-4 w-4" /> Photos</p>
            <p className="text-sm text-muted-foreground">Show photos on dish cards and dish detail modals.</p>
          </div>
          <Toggle checked={images} onChange={setImages} disabled={loading} ariaLabel="Show images" />
        </div>
      </FormSection>
    </Panel>
  );
}

function LayoutOption({ label, imgSrc, selected, onClick }: { label: string; imgSrc: string; selected: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant="outline"
        className={`w-36 h-28 p-2 flex items-center justify-center border-2 ${selected ? 'border-primary' : 'border-muted'} rounded-sm`}
        onClick={onClick}
      >
        <img src={imgSrc} alt={label} className="object-contain h-full w-full" />
      </Button>
      <span className="mt-2 text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function Toggle({ checked, onChange, disabled, ariaLabel = 'toggle' }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={ariaLabel}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export { DesignPanel };
