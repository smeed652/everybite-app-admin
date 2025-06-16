import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Convenience wrapper that applies Tailwind Typography (`prose`) styles.
 * Use this around Markdown or long-form copy blocks so they inherit global typography.
 */
export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Prose: React.FC<ProseProps> = ({ className, ...props }) => (
  <div className={cn('prose dark:prose-invert max-w-none', className)} {...props} />
);
