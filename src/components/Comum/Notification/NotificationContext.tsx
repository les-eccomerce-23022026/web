import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Notification, NotificationContextType, NotificationType } from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = crypto.randomUUID();
      const notification: Notification = {
        id,
        type,
        message,
        duration: duration ?? 5000,
      };

      setNotifications((prev) => [...prev, notification]);

      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, notification.duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showError = useCallback(
    (message: string, duration?: number) => {
      addNotification('error', message, duration);
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      addNotification('success', message, duration);
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      addNotification('warning', message, duration);
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      addNotification('info', message, duration);
    },
    [addNotification]
  );

  const value: NotificationContextType = {
    notifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
