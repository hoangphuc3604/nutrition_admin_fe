import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/enum/role.enum';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  data: {
    user: {
      id: string;
      email: string;
      roles: UserRole[];
      [key: string]: any;
    };
  };
}

const authApi = {
  adminLogin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse['data']>(
      '/auth/admin/login',
      credentials
    );
    return {
      message: response.message,
      accessToken: response.accessToken!,
      refreshToken: response.refreshToken!,
      data: response.data!,
    };
  },
};

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.adminLogin,
    onSuccess: (data) => {
      setAuth(
        data.data.user,
        data.accessToken,
        data.refreshToken
      );
    },
  });

  const login = (
    credentials: LoginRequest,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    loginMutation.mutate(credentials, {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error as Error);
      },
    });
  };

  const logout = () => {
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
  };
};

