import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Toggle';
import { PanelBottom } from 'lucide-react';
import { Widget } from '../../../generated/graphql';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function FooterPanel({ widget, onFieldChange }: Props) {
  const [showFooter, setShowFooter] = useState(widget.displayFooter);
  const [text, setText] = useState(widget.footerText ?? '');
  const [loading] = useState(false);

  // propagate changes upward
  useEffect(() => {
    const changes: Partial<Widget> = {};
    if (showFooter !== widget.displayFooter) changes.displayFooter = showFooter;
    if (text !== (widget.footerText ?? '')) changes.footerText = text;
    if (Object.keys(changes).length) onFieldChange(changes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFooter, text]);

  return (
    <section className="space-y-6" data-testid="footer-panel">
      <Card className="p-4 space-y-2 flex items-start justify-between">
        <div className="flex-1 space-y-2 pr-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <PanelBottom className="h-4 w-4" /> Footer
          </p>
          <p className="text-sm text-muted-foreground">Display custom text at the bottom of the SmartMenu.</p>
          {showFooter && (
            <Input
              placeholder="Footer text"
              value={text}
              maxLength={120}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>
        <Toggle checked={showFooter} onChange={setShowFooter} disabled={loading} />
      </Card>
    </section>
  );
}

export { FooterPanel };
