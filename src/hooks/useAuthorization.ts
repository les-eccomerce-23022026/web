import { useAppSelector } from '../store/hooks';
import { rolePermissions, type PermissionAction, type Role } from '../config/permissions';

export function useAuthorization() {
  const { user } = useAppSelector((state) => state.auth);

  const hasPermission = (action: PermissionAction): boolean => {
    if (!user || !user.role) return false;
    
    // Suporte para múltiplos papéis se necessário no futuro, ou apenas o atual
    const role = user.role as Role;
    const capabilities = rolePermissions[role] || [];
    return capabilities.includes(action);
  };

  const hasAdminAccess = hasPermission('access_admin_panel');

  return { 
    hasAdminAccess, 
    hasPermission, 
    role: user?.role as Role | undefined,
    isAuthenticated: !!user 
  };
}
