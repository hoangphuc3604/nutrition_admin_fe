import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  roles: string[];
  [key: string]: any;
}

interface UsersResponse {
  message: string;
  data: {
    users: User[];
    total: number;
  };
}

export const usersApi = {
  getUsers: async (): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse['data']>('/users', {
      requireAuth: true,
    });
    return {
      message: response.message,
      data: response.data!,
    };
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

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
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

