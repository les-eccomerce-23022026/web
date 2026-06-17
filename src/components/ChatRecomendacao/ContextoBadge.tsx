'use client';

import { History } from 'lucide-react';
import styles from './ContextoBadge.module.css';

interface ContextoBadgeProps {
  contextoUsado: boolean;
}

export const ContextoBadge = ({ contextoUsado }: ContextoBadgeProps) => {
  if (!contextoUsado) return null;

  return (
    <div
      className={styles.badge}
      data-cy="ia-contexto-historico-badge"
      role="status"
      aria-label="Recomendações baseadas no seu histórico"
    >
      <History size={12} className={styles.icon} />
      <span>Personalizado para você</span>
    </div>
  );
};
