import React from 'react';
import { useAuthorization } from '../../../hooks/useAuthorization';
import type { PermissionAction } from '../../../config/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requireAction: PermissionAction;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuardComponent - Encapsula a lógica de exibição baseada em permissões.
 * Regra #4: SRP - O componente que o consome não precisa conhecer a lógica de Redux ou Papéis.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requireAction, 
  fallback = null 
}) => {
  const { hasPermission } = useAuthorization();

  if (hasPermission(requireAction)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
