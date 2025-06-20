import { useState } from 'react';
import { Widget } from '../../../generated/graphql';
import { Card } from '../../../components/ui/Card';
import { Palette, Type as FontIcon } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

/*
 * BrandingPanel allows editing of color- and font-related branding fields.
 * Immediately reports each change to the parent so Save/Cancel become active.
 */
export default function BrandingPanel({ widget, onFieldChange }: Props) {
  // Colors
  const [primary, setPrimary] = useState(widget.primaryBrandColor ?? '#4338CA');
  const [secondary, setSecondary] = useState(widget.highlightColor ?? '#B4AFEa');
  const [background, setBackground] = useState(widget.backgroundColor ?? '#ffffff');

  // Fonts – API currently supports a single `fontFamily` field only
  const fonts = ['Plus Jakarta Sans', 'Inter', 'Open Sans', 'Roboto'];
  const [fontFamily, setFontFamily] = useState(widget.fontFamily ?? fonts[0]);

  // Handlers that update local state and notify parent once per user change
  const handlePrimary = (v: string) => {
    setPrimary(v);
    onFieldChange({ primaryBrandColor: v });
  };
  const handleSecondary = (v: string) => {
    setSecondary(v);
    onFieldChange({ highlightColor: v });
  };
  const handleBackground = (v: string) => {
    setBackground(v);
    onFieldChange({ backgroundColor: v });
  };
  const handleFont = (v: string) => {
    setFontFamily(v);
    if (v) onFieldChange({ fontFamily: v });
  };

  return (
    <section className="space-y-6" data-testid="branding-panel">
      <h3 className="text-lg font-semibold">Branding</h3>
      {/* Colors */}
      <Card className="p-4 space-y-4">
        <h4 className="flex items-center gap-2 font-medium"><Palette className="h-4 w-4" /> Colors</h4>
        <div className="space-y-3">
          <ColorInput label="Primary" value={primary} onChange={handlePrimary} />
          <ColorInput label="Secondary" value={secondary} onChange={handleSecondary} />
          <ColorInput label="Background" value={background} onChange={handleBackground} />
        </div>
      </Card>

      {/* Fonts */}
      <Card className="p-4 space-y-4">
        <h4 className="flex items-center gap-2 font-medium"><FontIcon className="h-4 w-4" /> Font</h4>
        <div>
          <label className="text-sm font-medium mr-3">Font family</label>
          <select
            className="border rounded px-2 py-1 text-sm w-60"
            style={{ fontFamily: fontFamily || 'inherit' }}
            value={fontFamily}
            onChange={(e) => handleFont(e.target.value)}
          >

            {/* include current font even if not in preset list */}
            {[fontFamily, ...fonts].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
          {fontFamily && (
            <span className="ml-4 text-base" style={{ fontFamily: fontFamily, fontSize: '125%' }} key={fontFamily}>
              The quick brown fox jumps over the lazy dog
            </span>
          )}
        </div>
      </Card>
    </section>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isValidHex = /^#([0-9a-fA-F]{6})$/.test(value);
  const safeColor = isValidHex ? value : '#ffffff';

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium">{label}</div>
      <div className="relative flex items-center">
        {/* preview circle */}
        <div
          className="h-10 w-10 rounded-full border cursor-pointer"
          style={{ background: safeColor }}
        />
        {/* transparent native color input covering the circle */}
        <input
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute top-0 left-0 h-10 w-10 opacity-0 cursor-pointer"
        />
      </div>
      <Input
        value={value}
        maxLength={7}
        onChange={(e) => {
          const v = e.target.value;
          // accept either #rrggbb or an empty string while user edits
          if (v === '' || /^#([0-9a-fA-F]{0,6})$/.test(v)) {
            onChange(v);
          }
        }}
        className="w-36"
      />
    </div>
  );
}
