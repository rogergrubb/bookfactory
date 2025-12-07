'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalContextValue {
  open: boolean;
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within Modal');
  return context;
};

// Root Modal component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <ModalContext.Provider value={{ open, onClose }}>
      <AnimatePresence>
        {open && children}
      </AnimatePresence>
    </ModalContext.Provider>,
    document.body
  );
}

// Backdrop
export function ModalBackdrop({ className }: { className?: string }) {
  const { onClose } = useModal();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm',
        className
      )}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

// Content
interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export function ModalContent({ 
  children, 
  className, 
  size = 'default',
  showClose = true 
}: ModalContentProps) {
  const { onClose } = useModal();
  
  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  };

  return (
    <>
      <ModalBackdrop />
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'relative w-full rounded-2xl bg-white shadow-xl',
            'dark:bg-stone-900 dark:border dark:border-stone-800',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {showClose && (
            <button
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition-colors',
                'hover:bg-stone-100 hover:text-stone-600',
                'dark:hover:bg-stone-800 dark:hover:text-stone-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          )}
          {children}
        </motion.div>
      </div>
    </>
  );
}

// Header
export function ModalHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)}>
      {children}
    </div>
  );
}

// Title
export function ModalTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <h2 className={cn(
      'font-display text-xl font-semibold text-stone-900 dark:text-stone-50',
      className
    )}>
      {children}
    </h2>
  );
}

// Description
export function ModalDescription({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn('mt-1 text-sm text-stone-500 dark:text-stone-400', className)}>
      {children}
    </p>
  );
}

// Body
export function ModalBody({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

// Footer
export function ModalFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 px-6 py-4',
      'border-t border-stone-200 dark:border-stone-800',
      className
    )}>
      {children}
    </div>
  );
}

// Confirm Dialog - Preset for confirmation modals
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const buttonVariant = {
    danger: 'destructive',
    warning: 'accent',
    default: 'primary',
  } as const;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={buttonVariant[variant]} 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
