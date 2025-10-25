'use client';

import React, { memo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface OptimizedLineChartProps {
  data: ChartData[];
  dataKey: string;
  title?: string;
}

interface OptimizedBarChartProps {
  data: ChartData[];
  dataKey: string;
  title?: string;
}

export const OptimizedLineChart = memo(({ data, dataKey }: OptimizedLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.dataKey === nextProps.dataKey &&
    prevProps.data.length === nextProps.data.length &&
    prevProps.data === nextProps.data
  );
});

OptimizedLineChart.displayName = 'OptimizedLineChart';

export const OptimizedBarChart = memo(({ data, dataKey }: OptimizedBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Bar dataKey={dataKey} fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.dataKey === nextProps.dataKey &&
    prevProps.data.length === nextProps.data.length &&
    prevProps.data === nextProps.data
  );
});

OptimizedBarChart.displayName = 'OptimizedBarChart';
