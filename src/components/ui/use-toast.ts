import { toast as hotToast } from 'react-hot-toast';

// Minimal wrapper to match shadcn/ui toast API shape used in the app.
export function useToast() {
  return {
    toast: hotToast,
  } as const;
}
