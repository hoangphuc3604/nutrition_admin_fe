import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  status: string;
  roles: string[];
  doneSurvey: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: PaginationInfo;
  };
}

const usersApi = {
  getUsers: async (params: UsersPaginationParams = {}): Promise<UsersResponse['data']> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.role) queryParams.append('role', params.role);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<UsersResponse['data']>(endpoint, {
      requireAuth: true,
    });
    return response.data!;
  },
  
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`, {
      requireAuth: true,
    });
    return response.data!;
  },
  
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data, {
      requireAuth: true,
    });
    return response.data!;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`, {
      requireAuth: true,
    });
  },
};

export const useUsers = (params: UsersPaginationParams = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export type { User, UsersPaginationParams, PaginationInfo };

