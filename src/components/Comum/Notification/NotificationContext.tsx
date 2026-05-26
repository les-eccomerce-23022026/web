import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Notification, NotificationContextType, NotificationType } from './types';
import { generateSafeId } from '@/utils/generateId';
import { NotificationContext } from './NotificationContext.context';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = generateSafeId();
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
};
