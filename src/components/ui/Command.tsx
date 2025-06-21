import * as React from 'react';
import * as RadixCommand from 'cmdk';
import { cn } from '../../lib/utils';

// Minimal shadcn/ui Command wrapper (combobox base)
// Exposes <Command>, <CommandInput>, <CommandGroup>, <CommandItem>

type CommandBaseProps = React.ComponentPropsWithoutRef<typeof RadixCommand.Command>;
export const Command = ({ className, ...props }: CommandBaseProps) => (
  <RadixCommand.Command
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
);

export const CommandInput = RadixCommand.CommandInput;
type CommandGroupBaseProps = React.ComponentPropsWithoutRef<typeof RadixCommand.CommandGroup>;
export const CommandGroup = ({ className, ...props }: CommandGroupBaseProps) => (
  <RadixCommand.CommandGroup className={cn('p-1', className)} {...props} />
);
type CommandItemBaseProps = React.ComponentPropsWithoutRef<typeof RadixCommand.CommandItem>;
export const CommandItem = ({ className, ...props }: CommandItemBaseProps) => (
  <RadixCommand.CommandItem
    className={cn('flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm', className)}
    {...props}
  />
);
