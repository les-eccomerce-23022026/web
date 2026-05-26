export type Role = 'cliente' | 'admin' | 'admin_sistema';
export type PermissionAction = 'access_admin_panel' | 'buy_books' | 'manage_users' | 'manage_admins' | 'manage_products' | 'manage_sales' | 'manage_delivery' | 'view_analytics';

export const rolePermissions: Record<Role, PermissionAction[]> = {
  admin_sistema: ['access_admin_panel', 'buy_books', 'manage_users', 'manage_admins', 'manage_products', 'manage_sales', 'manage_delivery', 'view_analytics'],
  admin: ['access_admin_panel', 'buy_books', 'manage_products', 'manage_sales', 'manage_delivery', 'view_analytics'],
  cliente: ['buy_books']
};

export const hasPermission = (role: Role, action: PermissionAction): boolean => {
  return rolePermissions[role]?.includes(action) ?? false;
};
