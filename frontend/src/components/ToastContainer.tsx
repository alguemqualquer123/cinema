'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications, ToastType } from '@/context/NotificationContext';

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colors: Record<ToastType, string> = {
  success: 'bg-green-600 border-green-500',
  error: 'bg-red-600 border-red-500',
  warning: 'bg-yellow-600 border-yellow-500',
  info: 'bg-blue-600 border-blue-500',
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
}

function ToastItem({ id, type, message }: ToastItemProps) {
  const { removeToast } = useNotifications();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        ${colors[type]}
        ${isLeaving ? 'animate-toast-leave' : 'animate-toast-enter'}
        min-w-[300px] max-w-md
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white font-bold">
        {icons[type]}
      </span>
      <p className="flex-1 text-white text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notificações"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
