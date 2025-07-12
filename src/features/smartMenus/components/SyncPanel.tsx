import { useState, useEffect } from 'react';
import { Widget } from '../../../generated/graphql';

import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Plug } from 'lucide-react';

interface Props {
  widget: Widget & { lastSyncedAt?: string | null };
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function SyncPanel({ widget, onFieldChange }: Props) {
  const [isSyncEnabled, setIsSyncEnabled] = useState(widget.isSyncEnabled);


  const handleToggle = (val: boolean) => {
    setIsSyncEnabled(val);
  };

  // update parent pending changes for save (in case we still want consistency)
  useEffect(() => {
    if (isSyncEnabled !== widget.isSyncEnabled) {
      onFieldChange({ isSyncEnabled });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncEnabled]);



  return (
    <section className="space-y-4" data-testid="sync-panel">
      <h3 className="text-lg font-semibold">Sync</h3>
      <SettingToggle
        icon={<Plug className="h-4 w-4" />}
        title="Sync"
        description="Turn automatic data syncing on or off."
        checked={isSyncEnabled}
        onChange={handleToggle}
      />


    </section>
  );
}
