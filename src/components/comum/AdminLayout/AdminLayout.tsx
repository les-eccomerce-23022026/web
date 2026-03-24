import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Archive, RefreshCw, Users, Settings, ChevronLeft, Home, Package } from 'lucide-react';
import styles from './AdminLayout.module.css';

import { useAppSelector } from '@/store/hooks';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
}

export function AdminLayout({ title, subtitle }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.headerAdmin}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        
        <div className={styles.headerNav}>
          <button 
            className={styles.navIconBtn} 
            onClick={() => navigate(-1)} 
            title="Voltar"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <Link to="/" className={styles.navIconBtn} title="Home da Loja">
            <Home size={24} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <aside className={styles.sidebarAdmin}>
          <ul>
            <li className={styles.sidebarGroupTitle}>Menu Principal</li>
            <li>
              <Link
                to="/admin"
                className={`${styles.sidebarLink} ${isActive('/admin') ? styles.sidebarLinkActive : ''}`}
              >
                <LayoutDashboard size={18} /> Dashboard Analytics
              </Link>
            </li>
            {user?.eAdminMestre && (
              <li>
                <Link
                  to="/admin/administradores"
                  className={`${styles.sidebarLink} ${isActive('/admin/administradores') ? styles.sidebarLinkActive : ''}`}
                >
                  <Settings size={18} /> Gerenciar Administradores
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/admin/livros"
                className={`${styles.sidebarLink} ${isActive('/admin/livros') ? styles.sidebarLinkActive : ''}`}
              >
                <BookOpen size={18} /> Gestão de Catálogo
              </Link>
            </li>
            <li>
              <Link
                to="/admin/estoque"
                className={`${styles.sidebarLink} ${isActive('/admin/estoque') ? styles.sidebarLinkActive : ''}`}
              >
                <Archive size={18} /> Controle de Estoque
              </Link>
            </li>
            <li>
              <Link
                to="/admin/pedidos"
                className={`${styles.sidebarLink} ${isActive('/admin/pedidos') ? styles.sidebarLinkActive : ''}`}
              >
                <Package size={18} /> Gerenciar Pedidos
              </Link>
            </li>

            <li className={styles.sidebarGroupTitle}>Atendimento</li>
            <li>
              <Link
                to="/admin/trocas"
                className={`${styles.sidebarLink} ${isActive('/admin/trocas') ? styles.sidebarLinkActive : ''}`}
              >
                <RefreshCw size={18} /> Solicitações &amp; Trocas
              </Link>
            </li>
            <li>
              <Link
                to="/admin/clientes"
                className={`${styles.sidebarLink} ${isActive('/admin/clientes') ? styles.sidebarLinkActive : ''}`}
              >
                <Users size={18} /> Gestão de Clientes
              </Link>
            </li>
          </ul>
        </aside>

        <div className={styles.contentAdmin}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
