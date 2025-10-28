'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateTrialStatus, formatTimeRemaining } from '@/lib/billing-utils';
import { PRICING_PLANS } from '@/lib/pricing-config';

interface TrialCountdownBannerProps {
  profile: {
    id: string;
    email: string;
    plan_tier: string;
    trial_end_date: string | null;
    grace_period_end: string | null;
    billing_status: string | null;
    stripe_customer_id: string | null;
    account_status?: string | null;
  };
}

export function TrialCountdownBanner({ profile }: TrialCountdownBannerProps) {
  const [loading, setLoading] = useState(false);
  const [trialStatus, setTrialStatus] = useState(() => calculateTrialStatus(profile));
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setTrialStatus(calculateTrialStatus(profile));
    }, 60000);

    return () => clearInterval(interval);
  }, [profile]);

  const handleAddPayment = async () => {
    setLoading(true);

    try {
      const plan = PRICING_PLANS[profile.plan_tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.starter;
      const priceId = plan.stripePriceId;

      if (!priceId) {
        toast({
          title: 'Configuration Error',
          description: 'Stripe is not properly configured. Please contact support.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: profile.id,
          email: profile.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (!trialStatus.shouldShowCountdown) {
    return null;
  }

  const getBannerStyles = () => {
    switch (trialStatus.urgencyLevel) {
      case 'danger':
        return {
          alertClass: 'border-red-500 bg-red-50 dark:bg-red-950/20',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-900 dark:text-red-200',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          alertClass: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
          iconColor: 'text-orange-600 dark:text-orange-400',
          textColor: 'text-orange-900 dark:text-orange-200',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        };
      default:
        return {
          alertClass: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-200',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const styles = getBannerStyles();
  const Icon = trialStatus.phase === 'grace_period' ? AlertTriangle : Clock;

  return (
    <Alert className={`${styles.alertClass} sticky top-0 z-50 mb-6`}>
      <Icon className={`h-5 w-5 ${styles.iconColor} animate-pulse`} />
      <AlertDescription className="ml-2 flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <p className={`font-bold ${styles.textColor} text-lg`}>
            {trialStatus.phase === 'grace_period' ? 'GRACE PERIOD ACTIVE' : 'FREE TRIAL ENDING SOON'}
          </p>
          <p className={`${styles.textColor} mt-1`}>
            {trialStatus.message}
          </p>
          <p className={`${styles.textColor} font-mono text-sm mt-2`}>
            Time remaining: {formatTimeRemaining(trialStatus.hoursRemaining)}
          </p>
        </div>
        <Button
          onClick={handleAddPayment}
          disabled={loading}
          className={styles.buttonClass}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
