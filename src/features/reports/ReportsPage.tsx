import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];

export function ReportsPage() {
  const { t } = useTranslation();

  const usageData = [
    { name: t('reports.months.jan'), users: 400, mealPlans: 240 },
    { name: t('reports.months.feb'), users: 600, mealPlans: 380 },
    { name: t('reports.months.mar'), users: 800, mealPlans: 520 },
    { name: t('reports.months.apr'), users: 1200, mealPlans: 780 },
    { name: t('reports.months.may'), users: 1600, mealPlans: 1100 },
    { name: t('reports.months.jun'), users: 2100, mealPlans: 1450 },
  ];

  const categoryData = [
    { name: t('reports.mealTypes.breakfast'), value: 35 },
    { name: t('reports.mealTypes.lunch'), value: 30 },
    { name: t('reports.mealTypes.dinner'), value: 25 },
    { name: t('reports.mealTypes.snacks'), value: 10 },
  ];

  return (
    <AdminLayout title={t('reports.title')}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t('reports.growthTitle')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  <Area type="monotone" dataKey="mealPlans" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>{t('reports.recipeCategories')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {categoryData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t('reports.monthlyActiveUsers')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
