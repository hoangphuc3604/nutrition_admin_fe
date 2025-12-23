import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Recipe {
  id: string;
  name: string;
  image_url: string;
  cuisine_type: string;
  prep_time_minutes: number;
  created_at: string;
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
  recipes: Recipe[];
  pagination: PaginationInfo;
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
  }
};

export const useRecipes = (params: RecipesPaginationParams) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.getRecipes(params),
  });
};
