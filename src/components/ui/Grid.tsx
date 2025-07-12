import { ReactNode } from 'react';

interface Props {
  /** Tailwind grid-cols-* value. Accepts number (1-12) or custom string (e.g. "repeat(auto-fill,minmax(200px,1fr))") */
  cols?: number | string;
  /** Gap between cells – Tailwind spacing scale key. Defaults to 4 */
  gap?: number | string;
  /** Additional utility classes */
  className?: string;
  children: ReactNode;
}

/**
 * Grid – convenience wrapper around Tailwind CSS grid utilities.
 * Keeps the markup DRY by computing `grid-cols-*` class from a prop.
 * If `cols` is a custom string, we use inline style for `gridTemplateColumns`.
 */
export default function Grid({ cols = 3, gap = 4, className = '', children }: Props) {
  const isNum = typeof cols === 'number';
  const colsClass = isNum ? `grid-cols-${cols}` : '';
  const style = !isNum ? { gridTemplateColumns: cols } : undefined;
  return (
    <div className={`grid ${colsClass} gap-${gap} ${className}`} style={style}>
      {children}
    </div>
  );
}
