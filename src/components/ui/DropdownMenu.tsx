import * as React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

interface ContentProps extends RadixDropdownMenu.DropdownMenuContentProps {
  className?: string;
}
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  ),
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, RadixDropdownMenu.DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <RadixDropdownMenu.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, RadixDropdownMenu.DropdownMenuCheckboxItemProps>(
  ({ className, ...props }, ref) => (
    <RadixDropdownMenu.CheckboxItem
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

export const DropdownMenuSeparator = ({ className, ...props }: RadixDropdownMenu.DropdownMenuSeparatorProps) => (
  <RadixDropdownMenu.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
);

