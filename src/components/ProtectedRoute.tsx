import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isHydrated, clearAuth } = useAuthStore();
  const { t } = useTranslation();

  if (!isHydrated) {
    return <div>{t('common.loading')}</div>;
  }

  if (!isAuthenticated || !isAdmin()) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

