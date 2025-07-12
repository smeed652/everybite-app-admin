import { ReactNode } from 'react';

interface Props {
  /** Optional heading rendered at top */
  title?: ReactNode;
  /** Optional sub-text under the heading */
  description?: ReactNode;
  /** Section body */
  children: ReactNode;
  /** Extra utility classes */
  className?: string;
}

/**
 * Section – lightweight container for grouping related UI with
 * consistent vertical spacing. Meant for page layouts and modals,
 * not as opinionated as Panel (no card shadow/rounded border).
 */
export default function Section({ title, description, children, className = '' }: Props) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description) && (
        <header className="space-y-1">
          {title && <h2 className="text-xl font-semibold leading-tight break-words">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground max-w-prose">{description}</p>}
        </header>
      )}

      <div className="space-y-4">{children}</div>
    </section>
  );
}
