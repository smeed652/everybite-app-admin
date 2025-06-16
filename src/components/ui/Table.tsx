import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, striped, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(
      'min-w-full text-left text-sm text-gray-900 dark:text-gray-100',
      striped && 'divide-y divide-gray-200 dark:divide-gray-700',
      className,
    )}
    {...props}
  />
));
Table.displayName = 'Table';

export const THead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-gray-100 dark:bg-gray-800', className)} {...props} />
  ),
);
THead.displayName = 'THead';

export const TBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)} {...props} />,
);
TBody.displayName = 'TBody';

export const TR = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors', className)} {...props} />
));
TR.displayName = 'TR';

export const TH = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300', className)}
    {...props}
  />
));
TH.displayName = 'TH';

export const TD = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-100', className)} {...props} />
));
TD.displayName = 'TD';
