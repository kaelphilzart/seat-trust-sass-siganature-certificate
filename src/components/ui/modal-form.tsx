'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

export default function Modal({
  open,
  title,
  onClose,
  onSubmit,
  children,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
}: ModalProps) {
  const isFormMode = typeof onSubmit === 'function';

  // Render modal ke portal supaya ga nge-lag
  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop tanpa motion & blur → lebih ringan */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            className={cn(
              'relative z-50 w-full max-w-lg rounded-3xl bg-white dark:bg-dark shadow-lg',
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className={cn(
                'flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 rounded-t-3xl',
                headerClassName
              )}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className={cn('px-4 py-4', bodyClassName)}>{children}</div>

            {/* Footer hanya muncul kalau form mode */}
            {isFormMode && (
              <div
                className={cn(
                  'flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-4 py-3 rounded-b-3xl',
                  footerClassName
                )}
              >
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button variant="default" onClick={onSubmit}>
                  Simpan
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
