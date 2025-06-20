import { useState, useEffect } from 'react';
import { Widget } from '../../../generated/graphql';
import { Card } from '../../../components/ui/Card';
import { Activity } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Toggle';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function BasicPanel({ widget, onFieldChange }: Props) {
  const [name, setName] = useState(widget.name);
  const [slug, setSlug] = useState(widget.slug);
  const [isActive, setIsActive] = useState(widget.isActive);
  const [loading] = useState(false);

  // report text changes immediately on each keystroke
  const handleNameChange = (val: string) => {
    setName(val);
    if (val !== widget.name) {
      onFieldChange({ name: val });
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    if (val !== widget.slug) {
      onFieldChange({ slug: val });
    }
  };

  // report toggle change
  useEffect(() => {
    if (isActive !== widget.isActive) {
      onFieldChange({ isActive });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);


  return (
    <section className="space-y-6" data-testid="basic-panel">
      <h3 className="text-lg font-semibold">Basics</h3>
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <Input id="name" value={name} onChange={e => handleNameChange(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="slug">Slug</label>
            <Input id="slug" value={slug} onChange={e => handleSlugChange(e.target.value)} disabled={loading} />
          </div>
        </div>
      </Card>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4" /> Status</p>
          <p className="text-sm text-muted-foreground">Activate or deactivate this SmartMenu.</p>
        </div>
        <Toggle checked={isActive} onChange={setIsActive} disabled={loading} />
      </Card>
    </section>
  );
}
