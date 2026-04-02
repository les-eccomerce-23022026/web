import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useAuthorization } from '@/hooks/useAuthorization';
import { LoadingState } from '../LoadingState/LoadingState';
import type { PermissionAction } from '@/config/permissions';

interface ProtectedRouteProps {
  requireAction?: PermissionAction;
}

/**
 * ProtectedRoute - Regra #1: Early Returns e OCP.
 * Protege rotas baseadas em capacidades (actions) ao invés de papéis fixos.
 */
export const ProtectedRoute = ({ requireAction }: ProtectedRouteProps) => {
  const { isAuthenticated, sessionLoading } = useAppSelector((state) => state.auth);
  const { hasPermission } = useAuthorization();

  // Guard Clauses limpos no topo
  if (sessionLoading) return <LoadingState />;
  if (!isAuthenticated) return <Navigate to="/minha-conta" replace />;
  
  if (requireAction && !hasPermission(requireAction)) {
    return <Navigate to="/" replace />; // Bloqueia acesso não autorizado
  }

  return <Outlet />;
}
