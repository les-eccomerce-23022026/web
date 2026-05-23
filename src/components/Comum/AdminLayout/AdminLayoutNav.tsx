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
import styles from './style.module.css';
import { ROTAS } from '@/config/rotas';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const MENU_PRINCIPAL: NavItem[] = [
  { href: ROTAS.ADMIN.HOME, label: 'Dashboard Analytics', icon: LayoutDashboard },
  { href: ROTAS.ADMIN.ADMINISTRADORES, label: 'Gerenciar Administradores', icon: Settings },
  { href: ROTAS.ADMIN.LIVROS, label: 'Gestão de Catálogo', icon: BookOpen },
  { href: ROTAS.ADMIN.ESTOQUE, label: 'Controle de Estoque', icon: Archive },
  { href: ROTAS.ADMIN.PEDIDOS, label: 'Gerenciar Pedidos', icon: Package },
];

const MENU_ATENDIMENTO: NavItem[] = [
  { href: ROTAS.ADMIN.TROCAS, label: 'Solicitações & Trocas', icon: RefreshCw },
  { href: ROTAS.ADMIN.CLIENTES, label: 'Gestão de Clientes', icon: Users },
];

export const AdminLayoutNav = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const renderItem = (item: NavItem) => {
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
