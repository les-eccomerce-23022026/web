'use client';

import styles from './ChatLoadingIndicator.module.css';

export const ChatLoadingIndicator = () => {
  return (
    <div
      className={styles.container}
      data-cy="ia-chatbot-loading"
      role="status"
      aria-label="Assistente digitando"
    >
      <div className={styles.message}>
        <span className={styles.text}>O assistente está pensando</span>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
};
