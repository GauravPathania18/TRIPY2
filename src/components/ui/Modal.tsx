/**
 * Shared modal shell: fixed backdrop + centered scrollable panel.
 * Backdrop click closes; panel clicks never bubble to the backdrop.
 *
 * Feature modals keep their own headers/animations inside `children`.
 */
import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Panel width class, e.g. "max-w-3xl". */
  maxWidth?: string;
  /** Extra classes for the panel (rounding, colors, padding...). */
  panelClassName?: string;
  /** Close when the backdrop is clicked (default true). */
  closeOnBackdrop?: boolean;
}

export default function Modal({
  onClose,
  children,
  maxWidth = 'max-w-3xl',
  panelClassName = '',
  closeOnBackdrop = true,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${maxWidth} my-auto rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-2xl ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
