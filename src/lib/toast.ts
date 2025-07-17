// Re-export the useToast hook for convenience
export { useToast } from "../components/ui/ToastProvider";

// This file is deprecated - use useToast() from ToastProvider instead
console.warn(
  "Importing from src/lib/toast is deprecated. Use useToast() from ToastProvider instead."
);
