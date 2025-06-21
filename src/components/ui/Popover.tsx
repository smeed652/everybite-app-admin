import * as React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

// Simple shadcn-style Popover wrapper so we can reuse <Popover>, <PopoverTrigger>, <PopoverContent>
// Keeps API identical to https://ui.shadcn.com/docs/components/popover but trimmed down.

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

interface ContentProps extends RadixPopover.PopoverContentProps {
  sideOffset?: number;
  className?: string;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';
