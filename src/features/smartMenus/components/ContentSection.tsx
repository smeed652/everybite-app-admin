import { Card } from '../../../components/ui/Card';
import { ColorRow } from '../../../components/ui/ColorRow';
import { Paintbrush2 } from 'lucide-react';

interface Props {
  contentGlobalColor: string;
  onGlobalColorChange: (v: string) => void;
  contentHeaderColor: string;
  onHeaderColorChange: (v: string) => void;
  fonts: string[];
  categoryFont: string;
  onCategoryFontChange: (v: string) => void;
  categoryColor: string;
  onCategoryColorChange: (v: string) => void;
}

/** Content-area colors & category font. */
export default function ContentSection({
  contentGlobalColor,
  onGlobalColorChange,
  contentHeaderColor,
  onHeaderColorChange,
  fonts,
  categoryFont,
  onCategoryFontChange,
  categoryColor,
  onCategoryColorChange,
}: Props) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Paintbrush2 aria-hidden="true" className="h-4 w-4" /> Content
      </div>

      <div className="space-y-4">
        <ColorRow
          label="Global Content Color"
          value={contentGlobalColor}
          onChange={onGlobalColorChange}
        />
        <ColorRow
          label="Column Header Color"
          value={contentHeaderColor}
          onChange={onHeaderColorChange}
        />

        <div className="space-y-1">
          <label htmlFor="category-font" className="text-sm font-medium">Category Title Font</label>
          <select
            id="category-font"
            value={categoryFont}
            onChange={(e) => onCategoryFontChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-60"
            style={{ fontFamily: categoryFont || 'inherit' }}
          >
            {[categoryFont, ...fonts]
              .filter(Boolean)
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
          </select>
        </div>

        <ColorRow
          label="Category Title Color"
          value={categoryColor}
          onChange={onCategoryColorChange}
        />
      </div>
    </Card>
  );
}

export { ContentSection };
