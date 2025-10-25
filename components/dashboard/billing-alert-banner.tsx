'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PRICING_PLANS } from '@/lib/pricing-config';

interface BillingAlertBannerProps {
  message: string;
  daysRemaining: number;
  planTier: string;
  userId: string;
  userEmail: string;
}

export function BillingAlertBanner({
  message,
  daysRemaining,
  planTier,
  userId,
  userEmail,
}: BillingAlertBannerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCompleteBillingSetup = async () => {
    setLoading(true);

    try {
      const plan = PRICING_PLANS[planTier as keyof typeof PRICING_PLANS] || PRICING_PLANS.starter;
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
          userId,
          email: userEmail,
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

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="ml-2 flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <p className="font-medium text-orange-900 dark:text-orange-200">
            {message}
          </p>
        </div>
        <Button
          onClick={handleCompleteBillingSetup}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Complete Billing Setup
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
