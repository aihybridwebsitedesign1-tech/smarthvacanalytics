export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    features: [
      'Up to 3 technicians',
      'Basic analytics (7d, 30d)',
      'Core KPI dashboard',
      'Email support'
    ],
    limits: {
      maxTechnicians: 3,
      analyticsRange: 30,
      exportEnabled: false,
      advancedFeatures: false
    }
  },
  growth: {
    name: 'Growth',
    price: 99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    popular: true,
    features: [
      'Up to 10 technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PDF/CSV)',
      'All HVAC-specific KPIs',
      'Priority support'
    ],
    limits: {
      maxTechnicians: 10,
      analyticsRange: 365,
      exportEnabled: true,
      advancedFeatures: true
    }
  },
  pro: {
    name: 'Pro',
    price: 199,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PDF/CSV)',
      'All HVAC-specific KPIs',
      'Dedicated support'
    ],
    limits: {
      maxTechnicians: Infinity,
      analyticsRange: 365,
      exportEnabled: true,
      advancedFeatures: true
    }
  }
} as const;

export type PlanTier = keyof typeof PRICING_PLANS;

export function getPlanLimits(planTier: string) {
  const plan = PRICING_PLANS[planTier as PlanTier];
  return plan?.limits || PRICING_PLANS.starter.limits;
}

export function canAccessFeature(planTier: string, feature: 'export' | 'advancedAnalytics' | 'unlimitedTechs') {
  const limits = getPlanLimits(planTier);

  switch (feature) {
    case 'export':
      return limits.exportEnabled;
    case 'advancedAnalytics':
      return limits.advancedFeatures;
    case 'unlimitedTechs':
      return limits.maxTechnicians === Infinity;
    default:
      return false;
  }
}
