export function formatCurrency(value: number, compact: boolean = false): string {
  if (compact) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatHours(value: number, compact: boolean = false): string {
  if (compact) {
    return `${value.toFixed(2)}h`;
  }
  return `${value.toFixed(2)} hours`;
}

export function formatNumber(value: number, compact: boolean = false): string {
  if (compact && value >= 1000) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatYAxisValue(value: number, type: 'currency' | 'percentage' | 'hours' | 'number'): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value, true);
    case 'percentage':
      return formatPercentage(value, 1);
    case 'hours':
      return formatHours(value, true);
    case 'number':
      return formatNumber(value, true);
    default:
      return value.toString();
  }
}

export function generateSmartTicks(min: number, max: number, targetCount: number = 8): number[] {
  const range = max - min;

  if (range === 0) {
    return [min];
  }

  const roughStep = range / (targetCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));

  const normalized = roughStep / magnitude;
  let step: number;

  if (normalized <= 1) {
    step = magnitude;
  } else if (normalized <= 2) {
    step = 2 * magnitude;
  } else if (normalized <= 5) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }

  const tickMin = Math.floor(min / step) * step;
  const tickMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let tick = tickMin; tick <= tickMax; tick += step) {
    ticks.push(tick);
  }

  return ticks;
}

export function getChartDomain(data: any[], key: string, buffer: number = 0.1): [number, number] {
  const values = data.map(d => d[key]).filter(v => typeof v === 'number' && !isNaN(v));

  if (values.length === 0) {
    return [0, 100];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const domainMin = Math.max(0, min - range * buffer);
  const domainMax = max + range * buffer;

  return [domainMin, domainMax];
}
