import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from './components/StatCard';
import { UsageChart } from './components/UsageChart';
import { PopularRecipesTable } from './components/PopularRecipesTable';
import { Users, CalendarDays, UtensilsCrossed, Carrot, TrendingUp, ClipboardCheck } from 'lucide-react';

export function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="12,689"
            icon={Users}
            trend={{ value: 8.5, isPositive: true, label: 'from yesterday' }}
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
          />
          <StatCard
            title="Meal Plans Created"
            value="3,425"
            icon={CalendarDays}
            trend={{ value: 12.3, isPositive: true, label: 'from last week' }}
            iconBgClass="bg-warning/10"
            iconColorClass="text-warning"
          />
          <StatCard
            title="Total Recipes"
            value="856"
            icon={UtensilsCrossed}
            trend={{ value: 4.3, isPositive: false, label: 'from yesterday' }}
            iconBgClass="bg-success/10"
            iconColorClass="text-success"
          />
          <StatCard
            title="Survey Completion"
            value="78%"
            icon={ClipboardCheck}
            trend={{ value: 1.8, isPositive: true, label: 'from yesterday' }}
            iconBgClass="bg-destructive/10"
            iconColorClass="text-destructive"
          />
        </div>

        <UsageChart />

        <PopularRecipesTable />
      </div>
    </AdminLayout>
  );
}
