import { useState, useEffect, useRef } from 'react';
import { Widget } from '../../../generated/graphql';
import { Panel } from '../../../components/ui/Panel';
import FormSection from '../../../components/ui/FormSection';
import FormField from '../../../components/ui/FormField';
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
  // Remember the last value we emitted so a Strict-Mode revert doesn’t wipe diffs
  const lastIsActiveRef = useRef(isActive);
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
    if (
      isActive !== widget.isActive &&
      isActive !== lastIsActiveRef.current // skip Strict-Mode revert
    ) {
      diff.isActive = isActive;
    }
    if (Object.keys(diff).length) {
      // log every diff in test/dev
      // eslint-disable-next-line no-console
      console.debug('[BasicPanel diff]', diff);
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_LOG_LEVEL === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[BasicPanel] emit', diff);
      }
      onFieldChange(diff);
      if (diff.isActive !== undefined) {
        lastIsActiveRef.current = isActive;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slug, isActive]);


  return (
    <Panel data-testid="basic-panel">
      <FormSection title="Basics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <Input id="name" value={name} onChange={e => handleNameChange(e.target.value)} disabled={loading} />
          </FormField>
          <FormField label="Slug" required>
            <Input id="slug" value={slug} onChange={e => handleSlugChange(e.target.value)} disabled={loading} />
          </FormField>
        </div>
      </FormSection>

      <SettingToggle
        icon={<Activity aria-hidden="true" className="h-4 w-4" />}
        title="Status"
        description="Activate or deactivate this SmartMenu."
        checked={isActive}
        onChange={setIsActive}
        disabled={loading}
      />
    </Panel>
  );
}

export { BasicPanel };
