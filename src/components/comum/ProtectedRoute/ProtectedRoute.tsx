import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  requiredRole?: 'cliente' | 'admin';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, sessionLoading } = useAppSelector((state) => state.auth);

  // Aguarda a verificação de sessão no startup — evita redirect prematuro para /minha-conta
  if (sessionLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/minha-conta" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
