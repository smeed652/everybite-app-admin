import React, { ReactNode } from 'react';

interface MetaItem {
  label: string;
  value: ReactNode;
}

interface Props {
  /** Heading level for the title element (1–6). Defaults to 1 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  title: ReactNode;
  meta?: MetaItem[];
  actions?: ReactNode;
}

/**
 * Generic fixed header for resource pages. Rendered inside the non-scrolling
 * region of <AppContent>. SmartMenuHeader and future headers should delegate
 * to this component.
 */
export default function ResourceHeader({ title, meta = [], actions, level = 1 }: Props) {
  return (
    <header className="space-y-4 sticky top-0 z-10 bg-white shadow-lg ring-2 ring-gray-300 py-8 px-6">
      <div className="flex justify-between items-start">
        {React.createElement(
          `h${level}`,
          { className: 'text-3xl font-semibold break-words max-w-full' },
          title,
        )}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {meta.length > 0 && (
        <div className="grid grid-flow-col auto-cols-fr gap-8 border-t pt-4">
          {meta.map((m, idx) => (
            <div key={idx} className="min-w-0">
              {React.createElement(
                `h${Math.min(level + 1, 6)}`,
                { className: 'text-sm font-medium text-muted-foreground truncate', title: m.label },
                m.label,
              )}
              <div className="text-sm break-all">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export { ResourceHeader };
