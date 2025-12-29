import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Period } from '@/enum/period.enum';

interface TrendData {
  value: number;
  isPositive: boolean;
  label: string;
}

interface MetricWithTrend {
  value: number;
  trend: TrendData;
}

interface OverviewStats {
  totalUsers: MetricWithTrend;
  mealPlansCreated: MetricWithTrend;
  totalRecipes: MetricWithTrend;
  surveyCompletion: MetricWithTrend;
}

interface TrendingRecipe {
  id: string;
  name: string;
  cuisine_type: string | null;
  like_count: number;
  later_count: number;
  total_interactions: number;
  description?: string | null;
  image_url?: string | null;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TrendingRecipesResponse {
  recipes: TrendingRecipe[];
  count: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface MetricChartData {
  totalUsers: ChartDataPoint[];
  mealPlansCreated: ChartDataPoint[];
  totalRecipes: ChartDataPoint[];
  surveyCompletion: ChartDataPoint[];
}

const dashboardApi = {
  getOverview: async (period: Period = Period.PERIOD_7D): Promise<OverviewStats> => {
    const response = await apiClient.get<OverviewStats>(
      `/admin/dashboard/overview?period=${period}`,
      { requireAuth: true }
    );
    return response.data!;
  },

  getCharts: async (period: Period = Period.PERIOD_7D): Promise<MetricChartData> => {
    const response = await apiClient.get<MetricChartData>(
      `/admin/dashboard/charts?period=${period}`,
      { requireAuth: true }
    );
    return response.data!;
  },

  getTrendingRecipes: async (limit: number = 10): Promise<TrendingRecipesResponse> => {
    const response = await apiClient.get<{ recipes: TrendingRecipe[]; count: number }>(
      `/recipes/trending?limit=${limit}`,
      { requireAuth: true }
    );
    return {
      recipes: response.data?.recipes || [],
      count: response.data?.count || 0,
    };
  },
};

export const useDashboardOverview = (period: Period = Period.PERIOD_7D) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => dashboardApi.getOverview(period),
  });
};

export const useDashboardCharts = (period: Period = Period.PERIOD_7D) => {
  return useQuery({
    queryKey: ['dashboard', 'charts', period],
    queryFn: () => dashboardApi.getCharts(period),
  });
};

export const useTrendingRecipes = (limit: number = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'trending-recipes', limit],
    queryFn: () => dashboardApi.getTrendingRecipes(limit),
  });
};

export type { OverviewStats, MetricWithTrend, TrendData, TrendingRecipe, TrendingRecipesResponse, ChartDataPoint, MetricChartData };




