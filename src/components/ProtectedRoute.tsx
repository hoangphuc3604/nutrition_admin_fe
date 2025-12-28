import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isHydrated, clearAuth } = useAuthStore();

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin()) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

