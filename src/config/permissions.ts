export type Role = 'cliente' | 'admin';
export type PermissionAction = 'access_admin_panel' | 'buy_books' | 'manage_users';

export const rolePermissions: Record<Role, PermissionAction[]> = {
  admin: ['access_admin_panel', 'buy_books', 'manage_users'],
  cliente: ['buy_books']
};

 
export const hasPermission = (role: Role, action: PermissionAction): boolean => {
    // o que singifca essa role e action? 
  return rolePermissions[role]?.includes(action) ?? false;
};
