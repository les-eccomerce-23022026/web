'use client';

import { ProtectedRoute } from '@/components/Comum/ProtectedRoute/ProtectedRoute';
import { AdminLayoutNav } from '@/components/Comum/AdminLayout/AdminLayoutNav';

/**
 * Layout Admin - Protege todas as rotas /admin/* exigindo autenticação
 * e permissão 'access_admin_panel', e inclui navegação lateral
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAction="access_admin_panel">
      <div className="admin-dashboard-container">
        <AdminLayoutNav />
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
