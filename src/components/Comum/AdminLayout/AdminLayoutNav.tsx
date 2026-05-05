import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  href: string;
  label: string;
  icon: LucideIcon;
  requiresMestre?: boolean;
};

const MENU_PRINCIPAL: NavItem[] = [
  { href: '/admin', label: 'Dashboard Analytics', icon: LayoutDashboard },
  { href: '/admin/administradores', label: 'Gerenciar Administradores', icon: Settings, requiresMestre: true },
  { href: '/admin/livros', label: 'Gestão de Catálogo', icon: BookOpen },
  { href: '/admin/estoque', label: 'Controle de Estoque', icon: Archive },
  { href: '/admin/pedidos', label: 'Gerenciar Pedidos', icon: Package },
];

const MENU_ATENDIMENTO: NavItem[] = [
  { href: '/admin/trocas', label: 'Solicitações & Trocas', icon: RefreshCw },
  { href: '/admin/clientes', label: 'Gestão de Clientes', icon: Users },
];

type Props = { eAdminMestre?: boolean };

export const AdminLayoutNav = ({ eAdminMestre }: Props) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const renderItem = (item: NavItem) => {
    if (item.requiresMestre && !eAdminMestre) return null;
    const Icon = item.icon;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
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
