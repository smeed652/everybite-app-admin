import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui style helper – merges Tailwind class strings with variants
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
