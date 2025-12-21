import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  iconBgClass?: string;
  iconColorClass?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon,
  trend,
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary"
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgClass)}>
          <Icon className={cn("h-6 w-6", iconColorClass)} />
        </div>
      </div>
    </div>
  );
}
