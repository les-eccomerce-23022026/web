import { useNotification } from './useNotification';
import { NotificationToast } from './NotificationToast';
import type { Notification as AppNotification } from './types';
import styles from './NotificationContainer.module.css';

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} data-cy="notification-container">
      {notifications.map((notification: AppNotification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};
