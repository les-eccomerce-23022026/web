import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  RefreshCw,
  Users,
  Settings,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './AdminLayout.module.css';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  requiresMestre?: boolean;
};

const MENU_PRINCIPAL: NavItem[] = [
  { to: '/admin', label: 'Dashboard Analytics', icon: LayoutDashboard },
  { to: '/admin/administradores', label: 'Gerenciar Administradores', icon: Settings, requiresMestre: true },
  { to: '/admin/livros', label: 'Gestão de Catálogo', icon: BookOpen },
  { to: '/admin/estoque', label: 'Controle de Estoque', icon: Archive },
  { to: '/admin/pedidos', label: 'Gerenciar Pedidos', icon: Package },
];

const MENU_ATENDIMENTO: NavItem[] = [
  { to: '/admin/trocas', label: 'Solicitações & Trocas', icon: RefreshCw },
  { to: '/admin/clientes', label: 'Gestão de Clientes', icon: Users },
];

type Props = { eAdminMestre?: boolean };

export const AdminLayoutNav = ({ eAdminMestre }: Props) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderItem = (item: NavItem) => {
    if (item.requiresMestre && !eAdminMestre) return null;
    const Icon = item.icon;
    return (
      <li key={item.to}>
        <Link
          to={item.to}
          className={`${styles.sidebarLink} ${isActive(item.to) ? styles.sidebarLinkActive : ''}`}
        >
          <Icon size={18} /> {item.label}
        </Link>
      </li>
    );
  };

  return (
    <aside className={styles.sidebarAdmin}>
      <ul>
        <li className={styles.sidebarGroupTitle}>Menu Principal</li>
        {MENU_PRINCIPAL.map(renderItem)}
        <li className={styles.sidebarGroupTitle}>Atendimento</li>
        {MENU_ATENDIMENTO.map(renderItem)}
      </ul>
    </aside>
  );
};
