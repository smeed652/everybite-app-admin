import { useState, useEffect } from 'react';
import { Widget } from '../../../generated/graphql';
import { Card } from '../../../components/ui/Card';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Activity } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function BasicPanel({ widget, onFieldChange }: Props) {
  const [name, setName] = useState(widget.name);
  const [slug, setSlug] = useState(widget.slug);
  const [isActive, setIsActive] = useState(widget.isActive);
  const [loading] = useState(false);

  // update local state; diff emitted in effect
  const handleNameChange = (val: string) => {
    setName(val);
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
  };

  // emit only changed fields whenever basics change
  useEffect(() => {
    const diff: Partial<Widget> = {};
    if (name !== widget.name) diff.name = name;
    if (slug !== widget.slug) diff.slug = slug;
    if (isActive !== widget.isActive) diff.isActive = isActive;
    if (Object.keys(diff).length) {
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_LOG_LEVEL === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[BasicPanel] emit', diff);
      }
      onFieldChange(diff);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slug, isActive]);


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

      <SettingToggle
        icon={<Activity className="h-4 w-4" />}
        title="Status"
        description="Activate or deactivate this SmartMenu."
        checked={isActive}
        onChange={setIsActive}
        disabled={loading}
      />
    </section>
  );
}
