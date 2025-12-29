import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from './components/StatCard';
import { UsageChart } from './components/UsageChart';
import { MetricsCharts } from './components/MetricsCharts';
import { Users, CalendarDays, UtensilsCrossed, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Period, PeriodLabels } from '@/enum/period.enum';
import { useDashboardOverview } from '@/api/dashboard.api';

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>(Period.PERIOD_7D);
  const { data: overview, isLoading } = useDashboardOverview(period);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overview Statistics</CardTitle>
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Period).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PeriodLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : overview ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={formatNumber(overview.totalUsers.value)}
                  icon={Users}
                  trend={overview.totalUsers.trend}
                  iconBgClass="bg-primary/10"
                  iconColorClass="text-primary"
                />
                <StatCard
                  title="Meal Plans Created"
                  value={formatNumber(overview.mealPlansCreated.value)}
                  icon={CalendarDays}
                  trend={overview.mealPlansCreated.trend}
                  iconBgClass="bg-warning/10"
                  iconColorClass="text-warning"
                />
                <StatCard
                  title="Total Recipes"
                  value={formatNumber(overview.totalRecipes.value)}
                  icon={UtensilsCrossed}
                  trend={overview.totalRecipes.trend}
                  iconBgClass="bg-success/10"
                  iconColorClass="text-success"
                />
                <StatCard
                  title="Survey Completion"
                  value={`${overview.surveyCompletion.value}%`}
                  icon={ClipboardCheck}
                  trend={overview.surveyCompletion.trend}
                  iconBgClass="bg-destructive/10"
                  iconColorClass="text-destructive"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* <UsageChart /> */}

        <MetricsCharts period={period} />
      </div>
    </AdminLayout>
  );
}
