'use client';

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { formatYAxisValue, generateSmartTicks, getChartDomain, formatCurrency, formatPercentage, formatHours, formatNumber } from '@/lib/format-utils';

interface EnhancedChartProps {
  data: any[];
  dataKey: string;
  type: 'line' | 'bar';
  valueType: 'currency' | 'percentage' | 'hours' | 'number';
  color?: string;
  height?: number;
  title?: string;
}

function CustomTooltip({ active, payload, label, valueType }: TooltipProps<any, any> & { valueType: string }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value;
  let formattedValue: string;

  switch (valueType) {
    case 'currency':
      formattedValue = formatCurrency(value, false);
      break;
    case 'percentage':
      formattedValue = formatPercentage(value, 2);
      break;
    case 'hours':
      formattedValue = formatHours(value, false);
      break;
    default:
      formattedValue = formatNumber(value, false);
  }

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold">{formattedValue}</p>
    </div>
  );
}

export function EnhancedChart({
  data,
  dataKey,
  type,
  valueType,
  color = 'hsl(var(--primary))',
  height = 300,
  title
}: EnhancedChartProps) {
  const [domainMin, domainMax] = useMemo(() => getChartDomain(data, dataKey), [data, dataKey]);

  const ticks = useMemo(() => {
    const tickCount = data.length > 180 ? 10 : 8;
    return generateSmartTicks(domainMin, domainMax, tickCount);
  }, [domainMin, domainMax, data.length]);

  const formatTick = (value: number) => formatYAxisValue(value, valueType);

  const chartProps = {
    data,
    margin: { top: 5, right: 10, left: 10, bottom: 5 },
  };

  const commonProps = {
    dataKey,
    ...(type === 'line' ? { stroke: color, strokeWidth: 2.5, dot: false, activeDot: { r: 6 } } : { fill: color }),
  };

  return (
    <div data-chart-title={title}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickMargin={8}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              ticks={ticks}
              tickFormatter={formatTick}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={70}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip valueType={valueType} />} />
            <Line {...commonProps} type="monotone" />
          </LineChart>
        ) : (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickMargin={8}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              ticks={ticks}
              tickFormatter={formatTick}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={70}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip valueType={valueType} />} />
            <Bar {...commonProps} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
