import { PRICING_PLANS, type PlanTier } from './pricing-config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  maxAllowed?: number;
  planName?: string;
}

export function validateTechnicianCount(planTier: string, technicianCount: number): ValidationResult {
  const plan = PRICING_PLANS[planTier as PlanTier];

  if (!plan) {
    return {
      isValid: false,
      error: 'Invalid plan selected',
    };
  }

  const maxTechnicians = plan.limits.maxTechnicians;

  if (maxTechnicians === Infinity) {
    return {
      isValid: true,
      maxAllowed: Infinity,
      planName: plan.name,
    };
  }

  if (technicianCount > maxTechnicians) {
    const suggestionPlan = getSuggestedPlan(technicianCount);

    return {
      isValid: false,
      error: `The ${plan.name} Plan allows up to ${maxTechnicians} technician${maxTechnicians === 1 ? '' : 's'}. ${
        suggestionPlan
          ? `Please reduce your technician count or upgrade to the ${suggestionPlan.name} Plan.`
          : 'Please reduce your technician count.'
      }`,
      maxAllowed: maxTechnicians,
      planName: plan.name,
    };
  }

  return {
    isValid: true,
    maxAllowed: maxTechnicians,
    planName: plan.name,
  };
}

export function getSuggestedPlan(technicianCount: number): typeof PRICING_PLANS[PlanTier] | null {
  if (technicianCount <= PRICING_PLANS.starter.limits.maxTechnicians) {
    return null;
  }

  if (technicianCount <= PRICING_PLANS.growth.limits.maxTechnicians) {
    return PRICING_PLANS.growth;
  }

  return PRICING_PLANS.pro;
}

export function getMaxTechniciansForPlan(planTier: string): number {
  const plan = PRICING_PLANS[planTier as PlanTier];
  return plan?.limits.maxTechnicians || 3;
}

export function canAddTechnicians(planTier: string, currentCount: number, toAdd: number = 1): ValidationResult {
  const newCount = currentCount + toAdd;
  return validateTechnicianCount(planTier, newCount);
}
