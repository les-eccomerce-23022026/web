import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  RefreshCw,
  Users,
  Settings,
  Package,
  Menu,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './style.module.css';
import { ROTAS } from '@/config/rotas';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useAppSelector } from '@/store/hooks';
import type { PermissionAction } from '@/config/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permissao?: PermissionAction;
};

const MENU_PRINCIPAL: NavItem[] = [
  { href: ROTAS.ADMIN.HOME, label: 'Dashboard Analytics', icon: LayoutDashboard, permissao: 'view_analytics' },
  { href: ROTAS.ADMIN.ADMINISTRADORES, label: 'Gerenciar Administradores', icon: Settings, permissao: 'manage_admins' },
  { href: ROTAS.ADMIN.LIVROS, label: 'Gestão de Catálogo', icon: BookOpen, permissao: 'manage_products' },
  { href: ROTAS.ADMIN.ESTOQUE, label: 'Controle de Estoque', icon: Archive, permissao: 'manage_products' },
  { href: ROTAS.ADMIN.PEDIDOS, label: 'Gerenciar Pedidos', icon: Package, permissao: 'manage_sales' },
];

const MENU_ATENDIMENTO: NavItem[] = [
  { href: ROTAS.ADMIN.TROCAS, label: 'Solicitações & Trocas', icon: RefreshCw, permissao: 'manage_sales' },
  { href: ROTAS.ADMIN.CLIENTES, label: 'Gestão de Clientes', icon: Users, permissao: 'manage_users' },
];

const MENU_ADMIN_SISTEMA: NavItem[] = [
  { href: ROTAS.ADMIN.HOME, label: 'Dashboard Analytics', icon: LayoutDashboard },
  { href: ROTAS.ADMIN.CLIENTES, label: 'Gestão de Clientes', icon: Users },
  { href: ROTAS.ADMIN.ADMINISTRADORES, label: 'Administradores de Lojas', icon: Settings },
];

export const AdminLayoutNav = () => {
  const pathname = usePathname();
  const { hasPermission } = useAuthorization();
  const user = useAppSelector((state) => state.auth.user);
  const isAdminSistema = user?.role === 'admin_sistema';
  const [menuAberto, setMenuAberto] = useState(false);
  const isActive = (path: string) => pathname === path;

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    
    if (item.permissao && !hasPermission(item.permissao)) {
      return null;
    }

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

  const menuPrincipalFiltrado = MENU_PRINCIPAL.filter(item =>
    !item.permissao || hasPermission(item.permissao)
  );

  const menuAtendimentoFiltrado = MENU_ATENDIMENTO.filter(item =>
    !item.permissao || hasPermission(item.permissao)
  );

  return (
    <>
      <button
        className={styles.menuHamburger}
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
        data-cy="menu-hamburger"
      >
        {menuAberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para fechar sidebar ao clicar fora */}
      {menuAberto && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setMenuAberto(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebarAdmin} ${menuAberto ? styles.sidebarAberto : ''}`}>
        {isAdminSistema ? (
          <ul data-cy="menu-admin-sistema">
            <li className={styles.sidebarGroupTitle}>Menu Principal</li>
            {MENU_ADMIN_SISTEMA.map(renderItem)}
          </ul>
        ) : (
          <ul data-cy="menu-admin-loja">
            <li className={styles.sidebarGroupTitle}>Menu Principal</li>
            {menuPrincipalFiltrado.map(renderItem)}
            {menuAtendimentoFiltrado.length > 0 && (
              <li className={styles.sidebarGroupTitle}>Atendimento</li>
            )}
            {menuAtendimentoFiltrado.map(renderItem)}
          </ul>
        )}
      </aside>
    </>
  );
};
