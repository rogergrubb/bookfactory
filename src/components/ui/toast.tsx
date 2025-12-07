'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toasts
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return {
    toast: context.addToast,
    dismiss: context.removeToast,
    // Convenience methods
    success: (title: string, description?: string) =>
      context.addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      context.addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      context.addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      context.addToast({ type: 'info', title, description }),
  };
}

// Toast Container
function ToastContainer() {
  const context = React.useContext(ToastContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted || !context) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-tooltip flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {context.toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => context.removeToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

// Individual Toast Item
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const styles = {
    success: {
      container: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    error: {
      container: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    warning: {
      container: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    info: {
      container: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
  };

  const style = styles[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-80 rounded-xl border bg-white p-4 shadow-lg',
        'dark:bg-stone-900',
        style.container
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('shrink-0 rounded-lg p-1', style.bg)}>
          <span className={style.icon}>{icons[toast.type]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Simple toast function for standalone use (requires ToastProvider)
export { ToastContainer };
