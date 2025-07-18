import { Check, X } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number; // ms
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (opts: ToastOptions) => {
      const id =
        globalThis.crypto?.randomUUID?.() ??
        Math.random().toString(36).slice(2);
      const toast: Toast = {
        id,
        variant: "default",
        duration: 3000,
        ...opts,
      };
      setToasts((t) => [...t, toast]);
      if (toast.duration! > 0) {
        setTimeout(() => remove(id), toast.duration);
      }
    },
    [remove]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-full">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const variantStyles: Record<string, string> = {
  default: "bg-white text-gray-900 border-gray-300 shadow-lg",
  success: "bg-green-50 text-green-700 border-green-500 shadow-lg",
  error: "bg-red-50 text-red-700 border-red-500 shadow-lg",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const isSuccess = toast.variant === "success";
  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      className={cn(
        "relative flex items-center gap-3 rounded-lg border-2 p-4 shadow-lg animate-in slide-in-from-bottom-2 fade-in",
        variantStyles[toast.variant ?? "default"]
      )}
    >
      {isSuccess && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        </div>
      )}
      {isError && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-50">
            <X className="h-4 w-4 text-red-600" />
          </div>
        </div>
      )}
      <div className="flex-1">
        <p className="font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-sm mt-1 opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        aria-label="Dismiss"
        onClick={onDismiss}
        className={cn(
          "flex-shrink-0 rounded p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
          isSuccess && "text-green-600 hover:bg-green-100 focus:ring-green-500",
          isError && "text-red-600 hover:bg-red-100 focus:ring-red-500",
          toast.variant === "default" &&
            "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
