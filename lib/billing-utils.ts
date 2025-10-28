export interface BillingStatus {
  needsPaymentMethod: boolean;
  isInGracePeriod: boolean;
  daysRemaining: number;
  message: string;
}

export function checkBillingStatus(profile: {
  billing_status: string | null;
  stripe_customer_id: string | null;
  subscription_end: string | null;
  created_at: string;
}): BillingStatus {
  const hasStripeCustomer = !!profile.stripe_customer_id;
  const status = profile.billing_status;

  if (hasStripeCustomer && status === 'active') {
    return {
      needsPaymentMethod: false,
      isInGracePeriod: false,
      daysRemaining: 0,
      message: '',
    };
  }

  if (!hasStripeCustomer || status !== 'active') {
    return {
      needsPaymentMethod: true,
      isInGracePeriod: false,
      daysRemaining: 0,
      message: 'Please add a payment method to activate your account.',
    };
  }

  return {
    needsPaymentMethod: false,
    isInGracePeriod: false,
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

