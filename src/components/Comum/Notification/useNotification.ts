import { useContext } from 'react';
import { NotificationContext } from './NotificationContext.context';
import type { NotificationContextType } from './types';

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
