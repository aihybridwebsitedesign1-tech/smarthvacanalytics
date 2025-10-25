import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tooltip?: string;
  trend?: number;
  invertTrend?: boolean;
}

export function KpiCard({ title, value, icon: Icon, tooltip, trend, invertTrend = false }: KpiCardProps) {
  const getTrendDisplay = () => {
    if (trend === undefined || trend === 0) return null;

    const isPositiveChange = invertTrend ? trend < 0 : trend > 0;
    const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
    const colorClass = isPositiveChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        <TrendIcon className="h-3 w-3" />
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {getTrendDisplay()}
        </div>
      </CardContent>
    </Card>
  );
}
