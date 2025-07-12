import { ReactNode } from 'react';

interface Props {
  /** The gap between children (Tailwind spacing scale key, e.g. 4 -> gap-4). Defaults to 4 */
  gap?: number | string;
  /** When true, stack is horizontal (row) instead of vertical (column) */
  horizontal?: boolean;
  /** Additional utility classes */
  className?: string;
  children: ReactNode;
}

/**
 * Stack – utility wrapper that lays children out with flex and a configurable gap.
 * Keeps markup terse and provides a typed API instead of remembering Tailwind strings.
 */
export default function Stack({ gap = 4, horizontal = false, className = '', children }: Props) {
  const dir = horizontal ? 'flex-row' : 'flex-col';
  return <div className={`flex ${dir} gap-${gap} ${className}`}>{children}</div>;
}
