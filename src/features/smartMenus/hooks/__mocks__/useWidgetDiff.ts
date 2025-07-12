import { vi } from 'vitest';
import React from 'react';

export const useWidgetDiff = vi.fn(() => {
  const [pending, setPending] = React.useState<Record<string, unknown>>({});
  return {
    formKey: 0,
    pendingChanges: pending,
    dirty: Object.keys(pending).length > 0,
    handleFieldChange: (c: Record<string, unknown>) => setPending((p) => ({ ...p, ...c })),
    reset: () => setPending({}),
    refreshSnapshot: () => setPending({}),
  };
});

export default { useWidgetDiff };
