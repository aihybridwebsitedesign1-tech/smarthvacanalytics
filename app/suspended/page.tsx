'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CreditCard, Loader2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { isAccountSuspended } from '@/lib/billing-utils';

export default function SuspendedPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && profile) {
      const suspended = isAccountSuspended(profile);
      if (!suspended && profile.stripe_customer_id) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  const handleAddPayment = async () => {
    if (!profile || !user) return;

    setPaymentLoading(true);

    try {
      const plan = PRICING_PLANS[profile.plan_tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.starter;
      const priceId = plan.stripePriceId;

      if (!priceId) {
        toast({
          title: 'Configuration Error',
          description: 'Stripe is not properly configured. Please contact support.',
          variant: 'destructive',
        });
        setPaymentLoading(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
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
      setPaymentLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const planName = profile.plan_tier.charAt(0).toUpperCase() + profile.plan_tier.slice(1);
  const plan = PRICING_PLANS[profile.plan_tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.starter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading">Account Suspended</CardTitle>
          <CardDescription className="text-base mt-2">
            Your free trial has expired and you haven't added a payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Access Blocked:</strong> Your trial period and grace period have ended. Add a payment method to reactivate your account and regain access to all features.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Your Selected Plan</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">{planName} Plan</p>
                <p className="text-muted-foreground">{profile.company_name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">${plan.price}</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {plan.features.map((feature, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {feature}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleAddPayment}
              disabled={paymentLoading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Add Payment Method & Reactivate
                </>
              )}
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact our support team at support@example.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
