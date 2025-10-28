export interface TrialStatus {
  phase: 'trial_active' | 'trial_countdown' | 'grace_period' | 'expired' | 'paid';
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  shouldShowCountdown: boolean;
  message: string;
  urgencyLevel: 'none' | 'info' | 'warning' | 'danger';
}

export interface BillingStatus {
  needsPaymentMethod: boolean;
  isInGracePeriod: boolean;
  daysRemaining: number;
  message: string;
}

export function calculateTrialStatus(profile: {
  trial_end_date: string | null;
  grace_period_end: string | null;
  billing_status: string | null;
  stripe_customer_id: string | null;
  account_status?: string | null;
}): TrialStatus {
  const now = new Date();
  const hasPaymentMethod = !!profile.stripe_customer_id;

  if (hasPaymentMethod && profile.billing_status === 'active') {
    return {
      phase: 'paid',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: false,
      shouldShowCountdown: false,
      message: '',
      urgencyLevel: 'none',
    };
  }

  if (!profile.trial_end_date) {
    return {
      phase: 'expired',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      shouldShowCountdown: false,
      message: 'Your trial has expired. Please add a payment method to continue.',
      urgencyLevel: 'danger',
    };
  }

  const trialEndDate = new Date(profile.trial_end_date);
  const timeUntilTrialEnd = trialEndDate.getTime() - now.getTime();
  const hoursUntilTrialEnd = timeUntilTrialEnd / (1000 * 60 * 60);
  const daysUntilTrialEnd = timeUntilTrialEnd / (1000 * 60 * 60 * 24);

  if (hoursUntilTrialEnd > 72) {
    return {
      phase: 'trial_active',
      daysRemaining: Math.ceil(daysUntilTrialEnd),
      hoursRemaining: Math.ceil(hoursUntilTrialEnd),
      isExpired: false,
      shouldShowCountdown: false,
      message: '',
      urgencyLevel: 'none',
    };
  }

  if (hoursUntilTrialEnd > 0) {
    const days = Math.floor(hoursUntilTrialEnd / 24);
    const hours = Math.floor(hoursUntilTrialEnd % 24);
    const message = days > 0
      ? `Your free trial ends in ${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}. Add a payment method now to continue using the service without interruption.`
      : `Your free trial ends in ${Math.ceil(hoursUntilTrialEnd)} hour${Math.ceil(hoursUntilTrialEnd) !== 1 ? 's' : ''}. Add a payment method now to avoid losing access.`;

    return {
      phase: 'trial_countdown',
      daysRemaining: Math.max(0, daysUntilTrialEnd),
      hoursRemaining: Math.ceil(hoursUntilTrialEnd),
      isExpired: false,
      shouldShowCountdown: true,
      message,
      urgencyLevel: hoursUntilTrialEnd < 24 ? 'danger' : 'warning',
    };
  }

  const gracePeriodEnd = profile.grace_period_end
    ? new Date(profile.grace_period_end)
    : new Date(trialEndDate.getTime() + 48 * 60 * 60 * 1000);

  const timeUntilGraceEnd = gracePeriodEnd.getTime() - now.getTime();
  const hoursUntilGraceEnd = timeUntilGraceEnd / (1000 * 60 * 60);

  if (hoursUntilGraceEnd > 0) {
    const hours = Math.ceil(hoursUntilGraceEnd);
    const message = `Grace period: ${hours} hour${hours !== 1 ? 's' : ''} remaining. Add a payment method immediately to avoid account suspension.`;

    return {
      phase: 'grace_period',
      daysRemaining: Math.max(0, hoursUntilGraceEnd / 24),
      hoursRemaining: hours,
      isExpired: false,
      shouldShowCountdown: true,
      message,
      urgencyLevel: 'danger',
    };
  }

  return {
    phase: 'expired',
    daysRemaining: 0,
    hoursRemaining: 0,
    isExpired: true,
    shouldShowCountdown: false,
    message: 'Your trial and grace period have expired. Add a payment method to reactivate your account.',
    urgencyLevel: 'danger',
  };
}

export function checkBillingStatus(profile: {
  billing_status: string | null;
  stripe_customer_id: string | null;
  subscription_end: string | null;
  trial_end_date: string | null;
  grace_period_end: string | null;
  created_at: string;
}): BillingStatus {
  const trialStatus = calculateTrialStatus(profile);

  if (trialStatus.phase === 'paid') {
    return {
      needsPaymentMethod: false,
      isInGracePeriod: false,
      daysRemaining: 0,
      message: '',
    };
  }

  if (trialStatus.phase === 'grace_period') {
    return {
      needsPaymentMethod: true,
      isInGracePeriod: true,
      daysRemaining: Math.ceil(trialStatus.hoursRemaining / 24),
      message: trialStatus.message,
    };
  }

  if (trialStatus.phase === 'expired') {
    return {
      needsPaymentMethod: true,
      isInGracePeriod: false,
      daysRemaining: 0,
      message: trialStatus.message,
    };
  }

  if (trialStatus.shouldShowCountdown) {
    return {
      needsPaymentMethod: true,
      isInGracePeriod: false,
      daysRemaining: Math.ceil(trialStatus.daysRemaining),
      message: trialStatus.message,
    };
  }

  return {
    needsPaymentMethod: false,
    isInGracePeriod: false,
    daysRemaining: Math.ceil(trialStatus.daysRemaining),
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

export function formatTimeRemaining(hoursRemaining: number): string {
  if (hoursRemaining < 1) {
    return 'Less than 1 hour';
  }

  const days = Math.floor(hoursRemaining / 24);
  const hours = Math.floor(hoursRemaining % 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

export function isAccountSuspended(profile: {
  account_status?: string | null;
  trial_end_date: string | null;
  grace_period_end: string | null;
  stripe_customer_id: string | null;
}): boolean {
  if (profile.account_status === 'suspended') {
    return true;
  }

  const trialStatus = calculateTrialStatus(profile as any);
  return trialStatus.isExpired && !profile.stripe_customer_id;
}
