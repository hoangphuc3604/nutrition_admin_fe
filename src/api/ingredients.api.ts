import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Ingredient {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  common_unit: string | null;
  storage_temperature: string | null;
  caloriesPerUnit?: number;
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
  }
};

export const useIngredients = (params: IngredientsPaginationParams) => {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: () => ingredientsApi.getIngredients(params),
  });
};

