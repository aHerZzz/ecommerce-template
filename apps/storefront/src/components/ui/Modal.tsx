import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

type ModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl outline-none dark:bg-surface-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="modal-title" className="text-xl font-semibold text-primary dark:text-text-dark">
            {title}
          </h2>
          <Button variant="ghost" aria-label="Cerrar modal" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}
