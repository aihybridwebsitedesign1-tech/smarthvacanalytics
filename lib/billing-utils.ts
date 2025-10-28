export interface BillingStatus {
  needsPaymentMethod: boolean;
  isInGracePeriod: boolean;
  daysRemaining: number;
  message: string;
  isTrialing?: boolean;
  trialEndsAt?: string | null;
}

export function checkBillingStatus(profile: {
  billing_status: string | null;
  stripe_customer_id: string | null;
  subscription_end: string | null;
  trial_end_date?: string | null;
  created_at: string;
}): BillingStatus {
  const hasStripeCustomer = !!profile.stripe_customer_id;
  const status = profile.billing_status;

  if (status === 'trialing' && profile.trial_end_date) {
    const trialEnd = new Date(profile.trial_end_date);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0) {
      return {
        needsPaymentMethod: false,
        isInGracePeriod: false,
        isTrialing: true,
        trialEndsAt: profile.trial_end_date,
        daysRemaining,
        message: `Your 14-day free trial has ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`,
      };
    }

    if (!hasStripeCustomer) {
      return {
        needsPaymentMethod: true,
        isInGracePeriod: false,
        isTrialing: false,
        trialEndsAt: null,
        daysRemaining: 0,
        message: 'Your trial has ended. Please add a payment method to continue using the service.',
      };
    }
  }

  if (hasStripeCustomer && status === 'active') {
    return {
      needsPaymentMethod: false,
      isInGracePeriod: false,
      isTrialing: false,
      trialEndsAt: null,
      daysRemaining: 0,
      message: '',
    };
  }

  if (!hasStripeCustomer || status !== 'active') {
    return {
      needsPaymentMethod: true,
      isInGracePeriod: false,
      isTrialing: false,
      trialEndsAt: null,
      daysRemaining: 0,
      message: 'Please add a payment method to activate your account.',
    };
  }

  return {
    needsPaymentMethod: false,
    isInGracePeriod: false,
    isTrialing: false,
    trialEndsAt: null,
    daysRemaining: 0,
    message: '',
  };
}

export function getRenewalDate(subscriptionEnd: string | null): string {
  if (!subscriptionEnd) return 'N/A';

  const date = new Date(subscriptionEnd);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

