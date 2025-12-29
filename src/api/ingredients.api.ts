import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Ingredient {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  common_unit: string | null;
  storage_temperature: "frozen" | "refrigerated" | "room_temp" | null;
  caloriesPerUnit?: number;
  description?: string;
  shelf_life_days?: number;
  created_at: string;
}

export interface IngredientsPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

interface IngredientsResponse {
  ingredients: Ingredient[];
  pagination: PaginationInfo;
}

export interface CreateIngredientRequest {
  name: string;
  description?: string;
  image_url?: string;
  category_id: string;
  shelf_life_days?: number;
  storage_temperature?: "frozen" | "refrigerated" | "room_temp";
  common_unit?: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  description?: string;
  image_url?: string;
  category_id?: string;
  shelf_life_days?: number;
  storage_temperature?: "frozen" | "refrigerated" | "room_temp";
  common_unit?: string;
}

const ingredientsApi = {
  getIngredients: async (params: IngredientsPaginationParams = {}): Promise<IngredientsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/ingredients${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<IngredientsResponse>(endpoint, { requireAuth: true });
    return response.data!;
  },

  createIngredient: async (data: CreateIngredientRequest | FormData): Promise<Ingredient> => {
    const response = await apiClient.post<Ingredient>('/admin/ingredients', data, { requireAuth: true });
    return response.data!;
  },

  updateIngredient: async (id: string, data: UpdateIngredientRequest | FormData): Promise<Ingredient> => {
    const response = await apiClient.put<Ingredient>(`/admin/ingredients/${id}`, data, { requireAuth: true });
    return response.data!;
  },

  getIngredientById: async (id: string): Promise<Ingredient> => {
    const response = await apiClient.get<Ingredient>(`/admin/ingredients/${id}`, { requireAuth: true });
    return response.data!;
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/ingredients/${id}`, { requireAuth: true });
  }
};

export const useIngredients = (params: IngredientsPaginationParams) => {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: () => ingredientsApi.getIngredients(params),
  });
};

export const useIngredient = (id: string) => {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => ingredientsApi.getIngredientById(id),
    enabled: !!id,
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingredientsApi.createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIngredientRequest | FormData }) =>
      ingredientsApi.updateIngredient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', id] });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingredientsApi.deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

