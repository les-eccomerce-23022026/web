'use client';

import { ProtectedRoute } from '@/components/Comum/ProtectedRoute/ProtectedRoute';
import { AdminLayoutNav } from '@/components/Comum/AdminLayout/AdminLayoutNav';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { ChatFlutuante } from '@/components/ChatRecomendacao/ChatFlutuante';
import styles from './layout.module.css';

/**
 * Layout Admin - Protege todas as rotas /admin/* exigindo autenticação
 * e permissão 'access_admin_panel', e inclui navegação lateral e header com seletor de loja
 * Inclui ChatFlutuante para administradores acessarem recomendações de IA
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAction="access_admin_panel">
      <div className="admin-dashboard-container">
        <AdminHeader />
        <div className={styles.adminContentWrapper}>
          <AdminLayoutNav />
          <main className="admin-main-content">
            {children}
          </main>
        </div>
        <ChatFlutuante />
      </div>
    </ProtectedRoute>
  );
}
