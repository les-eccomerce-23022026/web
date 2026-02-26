import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  requiredRole?: 'cliente' | 'admin';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/minha-conta" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Return to home if role mismatch
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
