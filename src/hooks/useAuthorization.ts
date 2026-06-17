import { useAppSelector } from '../store/hooks';
import { rolePermissions, type PermissionAction, type Role } from '../config/permissions';

export function useAuthorization() {
  const { user } = useAppSelector((state) => state.auth);

  const hasPermission = (action: PermissionAction): boolean => {
    if (!user) return false;
    
    // Verifica permissão em todos os papéis do usuário
    const papeis = (user.papeis && user.papeis.length > 0) ? user.papeis : [user.role];
    for (const papel of papeis) {
      const role = papel as Role;
      const capabilities = rolePermissions[role] || [];
      if (capabilities.includes(action)) {
        return true;
      }
    }
    return false;
  };

  const hasAdminAccess = hasPermission('access_admin_panel');

  return { 
    hasAdminAccess, 
    hasPermission, 
    role: user?.role as Role | undefined,
    papeis: user?.papeis,
    isAuthenticated: !!user 
  };
}
