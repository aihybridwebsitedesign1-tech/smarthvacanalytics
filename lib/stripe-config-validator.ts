import { PRICING_PLANS } from './pricing-config';

export function validateStripeConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured with a real key');
  }

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    warnings.push('STRIPE_SECRET_KEY is not configured with a real key');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
    warnings.push('STRIPE_WEBHOOK_SECRET is not configured');
  }

  Object.entries(PRICING_PLANS).forEach(([key, plan]) => {
    if (!plan.stripePriceId) {
      errors.push(`Missing stripePriceId for ${key} plan`);
    } else if (plan.stripePriceId.includes('test') && !plan.stripePriceId.startsWith('price_')) {
      warnings.push(`${key} plan stripePriceId appears to be a placeholder: ${plan.stripePriceId}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    priceIds: {
      starter: PRICING_PLANS.starter.stripePriceId,
      growth: PRICING_PLANS.growth.stripePriceId,
      pro: PRICING_PLANS.pro.stripePriceId,
    },
    config: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder'),
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes('placeholder'),
    }
  };
}

export function getStripePriceIds() {
  return {
    starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  };
}

export function logStripeConfig() {
  const validation = validateStripeConfig();

  console.log('=== Stripe Configuration Status ===');
  console.log('Valid:', validation.isValid);
  console.log('\nPrice IDs:');
  console.log('  Starter:', validation.priceIds.starter);
  console.log('  Growth:', validation.priceIds.growth);
  console.log('  Pro:', validation.priceIds.pro);
  console.log('\nConfiguration:');
  console.log('  Publishable Key:', validation.config.publishableKey);
  console.log('  Has Secret Key:', validation.config.hasSecretKey);
  console.log('  Has Webhook Secret:', validation.config.hasWebhookSecret);

  if (validation.errors.length > 0) {
    console.error('\nErrors:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn('\nWarnings:', validation.warnings);
  }

  console.log('===================================');

  return validation;
}
