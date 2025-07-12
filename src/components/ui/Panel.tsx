import { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PanelProps {
  /** Optional root element (defaults to `section`) */
  as?: ElementType;
  /** Panel heading text or custom node. */
  title?: ReactNode;
  /** Optional short description under the title. */
  description?: ReactNode;
  /** Optional content to render aligned right in the header (e.g., buttons, switches). */
  actions?: ReactNode;
  /** Main panel content. */
  children: ReactNode;
  /** Additional Tailwind classes for the root element. */
  className?: string;
  /** When true the header stays visible while scrolling inside the panel. */
  stickyHeader?: boolean;
}

/**
 * Generic layout wrapper for SmartMenu configuration panels.
 *
 * All existing concrete panels (Basics, Design, Marketing, Features, etc.)
 * should migrate to this component to ensure consistent spacing, typography,
 * and a11y across the admin UI.
 */
export function Panel({
  as: Root = 'section',
  title,
  description,
  actions,
  children,
  className,
  stickyHeader = false,
  ...rest
}: PanelProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Root className={cn('space-y-4', className)} data-testid="panel-root" {...rest}>
      {title && (
        <header
          className={cn(
            'flex items-start justify-between',
            stickyHeader && 'sticky top-0 z-10 bg-background/80 backdrop-blur'
          )}
        >
          <div className="space-y-1">
            {typeof title === 'string' ? (
              <h3 className="text-lg font-semibold leading-6">{title}</h3>
            ) : (
              title
            )}
            {description && (
              <p className="text-sm text-muted-foreground leading-5">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0 self-center">{actions}</div>}
        </header>
      )}
      {children}
    </Root>
  );
}

export default Panel;
