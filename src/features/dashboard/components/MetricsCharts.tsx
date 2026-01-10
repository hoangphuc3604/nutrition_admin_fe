import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardCharts } from '@/api/dashboard.api';
import { Period } from '@/enum/period.enum';
import { useTranslation } from 'react-i18next';

interface MetricsChartsProps {
  period: Period;
}

export function MetricsCharts({ period }: MetricsChartsProps) {
  const { t, i18n } = useTranslation();
  const { data: chartsData, isLoading } = useDashboardCharts(period);

  const getSamplingInterval = (dataLength: number): 'day' | 'month' => {
    // If we have less than ~60 points (2 months), show daily format
    if (dataLength <= 60) return 'day';
    return 'month';
  };

  const formatDate = (dateStr: string, dataLength: number) => {
    const date = new Date(dateStr);
    const interval = getSamplingInterval(dataLength);
    const lang = i18n.language;

    switch (interval) {
      case 'day':
        return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString(lang, { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'surveyCompletion') {
      return [`${value}%`, t('dashboard.charts.surveyCompletion')];
    }
    return [value, name];
  };

  const chartConfigs = [
    {
      key: 'totalUsers',
      title: t('dashboard.charts.totalUsersTrend'),
      color: '#8884d8',
      data: chartsData?.totalUsers || [],
    },
    {
      key: 'mealPlansCreated',
      title: t('dashboard.charts.mealPlansCreatedTrend'),
      color: '#82ca9d',
      data: chartsData?.mealPlansCreated || [],
    },
    {
      key: 'totalRecipes',
      title: t('dashboard.charts.totalRecipesTrend'),
      color: '#ffc658',
      data: chartsData?.totalRecipes || [],
    },
    {
      key: 'surveyCompletion',
      title: t('dashboard.charts.surveyCompletionTrend'),
      color: '#ff7300',
      data: chartsData?.surveyCompletion || [],
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartConfigs.map((config) => (
        <Card key={config.key} className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(value, config.data.length)}
                  fontSize={12}
                  minTickGap={30}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => formatDate(label, config.data.length)}
                  formatter={formatTooltipValue}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
