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

const dashboardApi = {
  getOverview: async (period: Period = Period.PERIOD_7D): Promise<OverviewStats> => {
    const response = await apiClient.get<OverviewStats>(
      `/admin/dashboard/overview?period=${period}`,
      { requireAuth: true }
    );
    return response.data!;
  },
};

export const useDashboardOverview = (period: Period = Period.PERIOD_7D) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => dashboardApi.getOverview(period),
  });
};

export type { OverviewStats, MetricWithTrend, TrendData };

