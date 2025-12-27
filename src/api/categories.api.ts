import { apiClient } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  name_en?: string | null;
}

const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories', { requireAuth: true });
    return response.data ?? [];
  }
};

export const useCategories = async (): Promise<Category[]> => {
  return await categoriesApi.getCategories();
};

export default categoriesApi;


