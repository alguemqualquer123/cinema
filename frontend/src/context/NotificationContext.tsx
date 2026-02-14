'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface Popup {
  id: string;
  title: string;
  content: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface NotificationContextType {
  toasts: Toast[];
  popups: Popup[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showPopup: (popup: Omit<Popup, 'id'>) => void;
  closePopup: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showPopup = useCallback((popup: Omit<Popup, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setPopups(prev => [...prev, { ...popup, id }]);
  }, []);

  const closePopup = useCallback((id: string) => {
    const popup = popups.find(p => p.id === id);
    if (popup?.onClose) {
      popup.onClose();
    }
    setPopups(prev => prev.filter(p => p.id !== id));
  }, [popups]);

  const showSuccess = useCallback((message: string) => {
    addToast({ type: 'success', message });
  }, [addToast]);

  const showError = useCallback((message: string) => {
    addToast({ type: 'error', message, duration: 8000 });
  }, [addToast]);

  const showWarning = useCallback((message: string) => {
    addToast({ type: 'warning', message });
  }, [addToast]);

  const showInfo = useCallback((message: string) => {
    addToast({ type: 'info', message });
  }, [addToast]);

  return (
    <NotificationContext.Provider value={{
      toasts,
      popups,
      addToast,
      removeToast,
      showPopup,
      closePopup,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function useToast() {
  const { addToast, removeToast, showSuccess, showError, showWarning, showInfo } = useNotifications();
  return { addToast, removeToast, showSuccess, showError, showWarning, showInfo };
}

export function usePopup() {
  const { showPopup, closePopup, popups } = useNotifications();
  return { showPopup, closePopup, popups };
}
