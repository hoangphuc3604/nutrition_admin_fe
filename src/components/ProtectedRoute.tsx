import { Navigate } from 'react-router-dom';
import { useAuth } from '@/api/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

