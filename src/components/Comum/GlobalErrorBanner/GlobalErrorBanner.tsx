import { useNotification } from '@/components/Comum/Notification/useNotification';
import type { Notification as AppNotification } from '@/components/Comum/Notification/types';
import { X, AlertCircle } from 'lucide-react';
import styles from './GlobalErrorBanner.module.css';

/**
 * Banner de erro global posicionado abaixo do header.
 * Mostra apenas notificações de erro para dar visibilidade adicional
 * a erros críticos que afetam o fluxo principal.
 */
export const GlobalErrorBanner = () => {
  const { notifications, removeNotification } = useNotification();

  // Filtra apenas erros para o banner
  const errorNotifications = notifications.filter((n: AppNotification) => n.type === 'error');

  if (errorNotifications.length === 0) {
    return null;
  }

  // Mostra apenas o erro mais recente no banner
  const latestError = errorNotifications[errorNotifications.length - 1];

  return (
    <div
      className={styles.banner}
      role="alert"
      aria-live="assertive"
      data-cy="global-error-banner"
    >
      <div className={styles.bannerContent}>
        <AlertCircle size={20} className={styles.icon} />
        <p className={styles.message}>{latestError.message}</p>
        <button
          onClick={() => removeNotification(latestError.id)}
          className={styles.closeButton}
          aria-label="Fechar mensagem de erro"
          data-cy="global-error-banner-close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
