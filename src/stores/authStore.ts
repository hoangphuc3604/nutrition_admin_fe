import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/enum/role.enum';

interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  [key: string]: any;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      isAdmin: () => {
        const user = get().user;
        return user?.roles?.includes(UserRole.ADMIN) || false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

