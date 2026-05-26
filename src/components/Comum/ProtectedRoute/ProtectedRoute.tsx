import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useAuthorization } from '@/hooks/useAuthorization';
import { LoadingState } from '../LoadingState/LoadingState';
import type { PermissionAction } from '@/config/permissions';

interface ProtectedRouteProps {
  requireAction?: PermissionAction;
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Regra #1: Early Returns e OCP.
 * Protege rotas baseadas em capacidades (actions) ao invés de papéis fixos.
 * No Next.js App Router, usa redirecionamento imperativo via useRouter.
 */
export const ProtectedRoute = ({ requireAction, children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, sessionLoading } = useAppSelector((state) => state.auth);
  const { hasPermission } = useAuthorization();

  // Guard Clauses limpos no topo
  if (sessionLoading) return <LoadingState />;
  if (!isAuthenticated) {
    router.replace('/minha-conta');
    return <LoadingState />;
  }
  
  if (requireAction && !hasPermission(requireAction)) {
    router.replace('/');
    return <LoadingState />;
  }

  return <>{children}</>;
}
