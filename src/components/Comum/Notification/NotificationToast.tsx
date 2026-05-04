import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';
import type { Notification as NotificationType } from './types';
import styles from './NotificationToast.module.css';

interface NotificationToastProps {
  notification: NotificationType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle size={20} className={styles.iconSuccess} />,
  error: <AlertCircle size={20} className={styles.iconError} />,
  warning: <AlertTriangle size={20} className={styles.iconWarning} />,
  info: <Info size={20} className={styles.iconInfo} />,
};

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(onClose, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[notification.type]}`}
      data-cy="notification-toast"
      data-cy-notification-type={notification.type}
    >
      <div className={styles.icon}>{icons[notification.type]}</div>
      <p className={styles.message}>{notification.message}</p>
      <button
        onClick={onClose}
        className={styles.closeButton}
        data-cy="notification-close"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
}
