import { useNotification } from './useNotification';
import { NotificationToast } from './NotificationToast';
import styles from './NotificationContainer.module.css';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} data-cy="notification-container">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
