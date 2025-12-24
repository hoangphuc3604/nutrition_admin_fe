import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { UserRole } from '@/enum/role.enum';

interface User {
  id: string;
  email: string;
  status: string;
  roles: UserRole[];
  doneSurvey: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  age: number | null;
  height: number;
  weight: number;
  activity_level: string;
  health_goal: string;
  target_weight: number | null;
  medical_conditions: string[] | null;
  allergies: string[] | null;
  dietary_restrictions: string[] | null;
  dietary_preferences: string[] | null;
  daily_calorie_target: number | null;
  preferences: {
    cuisines: string[];
    spiceLevel: number;
    cookingTime: number;
    mealTypes: string[];
  } | null;
}

interface UserStats {
  completedMeals: number;
  likedMeals: number;
  daysUsingApp: number;
}

interface UserCounts {
  totalMealPlans: number;
  totalFridgeItems: number;
}

interface UserDetail {
  user: User;
  profile: UserProfile | null;
  stats: UserStats;
  counts: UserCounts;
}

interface UsersPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: UserRole | string;
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

interface UserProfile {
  age: number | null;
  height: number;
  weight: number;
  activity_level: string;
  health_goal: string;
  target_weight: number | null;
  medical_conditions: string[] | null;
  allergies: string[] | null;
  dietary_restrictions: string[] | null;
  dietary_preferences: string[] | null;
  daily_calorie_target: number | null;
  preferences: {
    cuisines: string[];
    spiceLevel: number;
    cookingTime: number;
    mealTypes: string[];
  } | null;
}

interface UserStats {
  completedMeals: number;
  likedMeals: number;
  daysUsingApp: number;
}

interface UserCounts {
  totalMealPlans: number;
  totalFridgeItems: number;
}

interface UserDetail {
  user: User;
  profile: UserProfile | null;
  stats: UserStats;
  counts: UserCounts;
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

  getUserDetail: async (id: string): Promise<UserDetail> => {
    const response = await apiClient.get<UserDetail>(`/admin/users/${id}`, {
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

  updateUserRoles: async (id: string, roles: UserRole[]): Promise<User> => {
    const response = await apiClient.put<User>(
      `/admin/users/${id}/roles`,
      { roles },
      {
        requireAuth: true,
      }
    );
    return response.data!;
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

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ['userDetail', id],
    queryFn: () => usersApi.getUserDetail(id),
    enabled: !!id,
  });
};

export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRole[] }) =>
      usersApi.updateUserRoles(id, roles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userDetail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

export type { User, UserDetail, UserProfile, UserStats, UserCounts, UsersPaginationParams, PaginationInfo };

