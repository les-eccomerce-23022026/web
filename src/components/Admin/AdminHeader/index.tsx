'use client';

import { SeletorLoja } from '@/components/Admin/SeletorLoja';
import styles from './adminHeader.module.css';

/**
 * Header do painel admin com seletor de loja para admins multi-loja.
 * - Exibe seletor de loja se admin tiver múltiplas lojas
 * - Posicionado no topo do painel admin
 */
export const AdminHeader = () => {
  return (
    <header className={styles.headerAdmin} data-cy="admin-header">
      <div className={styles.headerContent}>
        <h1 className={styles.titulo}>Painel Administrativo</h1>
        <SeletorLoja />
      </div>
    </header>
  );
};
