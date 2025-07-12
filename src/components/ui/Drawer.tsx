import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import React from 'react';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Side from which the drawer slides */
  side?: 'left' | 'right';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Drawer – built on Radix Dialog, slides from left or right.
 */
export function Drawer({ open, onOpenChange, side = 'right', title, children, className }: DrawerProps) {
  const sideClasses = side === 'left' ? '-translate-x-full left-0' : 'translate-x-full right-0';
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content
          className={cn(
            `fixed top-0 z-50 h-full w-80 bg-white dark:bg-gray-900 dark:text-gray-100 p-6 shadow-lg animate-in slide-in-from-${side}-full`,
            sideClasses,
            className,
          )}
        >
          <div className="flex items-center justify-between mb-4">
            {title && <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>}
            <Dialog.Close asChild>
              <button aria-label="Close" className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
