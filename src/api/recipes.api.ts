import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Recipe } from '@/types';

export interface RecipeListItem {
  id: string;
  name: string;
  image_url?: string;
  cuisine_type?: string;
  prep_time_minutes?: number;
  created_at: string; // Backend returns created_at from query
}

export interface RecipesPaginationParams {
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

interface RecipesResponse {
  recipes: RecipeListItem[];
  pagination: PaginationInfo;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  image_url?: string;
  cuisine_type?: string;
  difficulty_level: "easy" | "medium" | "hard";
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  instructions?: string;
  ingredients?: RecipeIngredientRequest[];
}

export interface UpdateRecipeRequest {
  name?: string;
  description?: string;
  image_url?: string;
  cuisine_type?: string;
  difficulty_level?: "easy" | "medium" | "hard";
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  instructions?: string;
  ingredients?: RecipeIngredientRequest[];
}

export interface RecipeIngredientRequest {
  ingredientId: string;
  quantity: number;
  unit: string;
  preparationMethod?: string;
  isOptional?: boolean;
  sortOrder?: number;
}

const recipesApi = {
  getRecipes: async (params: RecipesPaginationParams = {}): Promise<RecipesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/recipes${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<RecipesResponse>(endpoint, { requireAuth: true });
    return response.data!;
  },

  getRecipeById: async (id: string): Promise<Recipe> => {
    const response = await apiClient.get<Recipe>(`/admin/recipes/${id}`, { requireAuth: true });
    return response.data!;
  },

  createRecipe: async (data: CreateRecipeRequest): Promise<Recipe> => {
    const response = await apiClient.post<Recipe>('/admin/recipes', data, { requireAuth: true });
    return response.data!;
  },

  updateRecipe: async (id: string, data: UpdateRecipeRequest): Promise<Recipe> => {
    const response = await apiClient.put<Recipe>(`/admin/recipes/${id}`, data, { requireAuth: true });
    return response.data!;
  },

  deleteRecipe: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/recipes/${id}`, { requireAuth: true });
  }
};

export const useRecipes = (params: RecipesPaginationParams) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.getRecipes(params),
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipesApi.getRecipeById(id),
    enabled: !!id,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recipesApi.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipeRequest }) =>
      recipesApi.updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe'] });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recipesApi.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};
