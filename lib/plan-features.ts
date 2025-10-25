import { PRICING_PLANS, type PlanTier } from './pricing-config';

export function canAccessTimeRange(planTier: string | null | undefined, daysRange: number): boolean {
  if (!planTier) return daysRange <= 30;

  const plan = PRICING_PLANS[planTier as PlanTier];
  if (!plan) return daysRange <= 30;

  return daysRange <= plan.limits.analyticsRange;
}

export function canExportReports(planTier: string | null | undefined): boolean {
  if (!planTier) return false;

  const plan = PRICING_PLANS[planTier as PlanTier];
  return plan?.limits.exportEnabled || false;
}

export function getMaxTechnicians(planTier: string | null | undefined): number {
  if (!planTier) return 3;

  const plan = PRICING_PLANS[planTier as PlanTier];
  return plan?.limits.maxTechnicians || 3;
}

export function canAddMoreTechnicians(
  planTier: string | null | undefined,
  currentCount: number
): boolean {
  const maxTechs = getMaxTechnicians(planTier);
  if (maxTechs === Infinity) return true;
  return currentCount < maxTechs;
}

export function getPlanDisplayName(planTier: string | null | undefined): string {
  if (!planTier) return 'Starter';

  const plan = PRICING_PLANS[planTier as PlanTier];
  return plan?.name || 'Starter';
}

export function isTrialActive(
  billingStatus: string | null | undefined,
  trialEndDate: string | null | undefined
): boolean {
  if (billingStatus !== 'trialing') return false;
  if (!trialEndDate) return false;

  return new Date(trialEndDate) > new Date();
}

export function getAvailableTimeRanges(planTier: string | null | undefined) {
  const ranges = [
    { label: '7 Days', value: 7, days: 7 },
    { label: '30 Days', value: 30, days: 30 },
  ];

  if (canAccessTimeRange(planTier, 90)) {
    ranges.push({ label: '3 Months', value: 90, days: 90 });
  }

  if (canAccessTimeRange(planTier, 180)) {
    ranges.push({ label: '6 Months', value: 180, days: 180 });
  }

  if (canAccessTimeRange(planTier, 365)) {
    ranges.push({ label: '1 Year', value: 365, days: 365 });
  }

  return ranges;
}
