import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

/**
 * shadcn/ui Sheet – wrapper around Radix Dialog that slides from the left.
 * Only the primitives we need for a mobile sidebar.
 */
export const Sheet = DialogPrimitive.Root;

export const SheetTrigger = DialogPrimitive.Trigger;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: 'left' | 'right' | 'top' | 'bottom';
  }
>(({ className, side = 'left', children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col bg-background p-6 shadow-lg ease-out animate-in',
        side === 'left' && 'inset-y-0 left-0 w-3/4 max-w-xs slide-in-from-left',
        side === 'right' && 'inset-y-0 right-0 w-80 slide-in-from-right',
        side === 'top' && 'inset-x-0 top-0 h-1/3 slide-in-from-top',
        side === 'bottom' && 'inset-x-0 bottom-0 h-1/3 slide-in-from-bottom',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
