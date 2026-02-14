'use client';

import React, { useEffect, useRef } from 'react';
import { useNotifications } from '@/context/NotificationContext';

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

function Modal({ id, title, children, onClose, showCloseButton = true, size = 'md' }: ModalProps) {
  const { closePopup } = useNotifications();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleClose = () => {
    closePopup(id);
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-[var(--card)] border border-[var(--border)]
          rounded-xl shadow-2xl
          animate-modal-enter
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full
                         text-zinc-400 hover:text-white hover:bg-[var(--card-hover)]
                         transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PopupContainer() {
  const { popups } = useNotifications();

  if (popups.length === 0) return null;

  return (
    <>
      {popups.map(popup => (
        <Modal
          key={popup.id}
          id={popup.id}
          title={popup.title}
          onClose={popup.onClose}
          showCloseButton={popup.showCloseButton}
          size={popup.size}
        >
          {popup.content}
        </Modal>
      ))}
    </>
  );
}
