import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
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
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((opts: ToastOptions) => {
    const id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const toast: Toast = {
      id,
      variant: 'default',
      duration: 3000,
      ...opts,
    };
    setToasts((t) => [...t, toast]);
    if (toast.duration! > 0) {
      setTimeout(() => remove(id), toast.duration);
    }
  }, [remove]);

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
        document.body,
      )}
    </ToastContext.Provider>
  );
};

const variantStyles: Record<string, string> = {
  default: 'bg-white text-gray-900 border',
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className={cn(
        'relative flex items-start gap-3 rounded-md border p-4 shadow-md animate-in slide-in-from-bottom-2 fade-in',
        variantStyles[toast.variant ?? 'default'],
      )}
    >
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.description && <p className="text-sm mt-1 opacity-80">{toast.description}</p>}
      </div>
      <button
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute top-2 right-2 rounded p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
