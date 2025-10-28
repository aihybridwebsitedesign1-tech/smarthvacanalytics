'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { useAuth } from '@/components/providers/auth-provider';
import { getStripe } from '@/lib/stripe-client';
import { toast } from '@/hooks/use-toast';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!plan.stripePriceId) {
      toast({
        title: 'Configuration Error',
        description: 'Stripe is not configured for this plan.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(planKey);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
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
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {user && (
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/settings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settings
              </Link>
            </Button>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-full text-lg font-semibold mb-6">
            🎉 14-Day Free Trial • No Credit Card Required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Choose the perfect plan for your HVAC business.
          </p>
          <p className="text-lg font-medium text-foreground">
            Start your free trial today. Payment only required after 14 days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => {
            const isCurrentPlan = profile?.plan_tier === key;
            const isPopular = 'popular' in plan && plan.popular;

            return (
              <Card
                key={key}
                className={`relative ${
                  isPopular ? 'border-primary shadow-lg scale-105' : ''
                } ${isCurrentPlan ? 'border-green-500' : ''}`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    14 Days FREE
                  </span>
                </div>
                {isPopular && (
                  <div className="absolute -top-3 right-4 z-10">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground line-through mb-1">
                      First 14 days: $0
                    </div>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    After trial • Billed monthly
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(key)}
                      disabled={loading !== null}
                    >
                      {loading === key ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : user ? (
                        'Add Payment Method'
                      ) : (
                        'Start Free Trial'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-3xl mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-3">How the Free Trial Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">1. Sign Up Free</div>
                <p className="text-muted-foreground">No credit card required. Start using all features immediately.</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">2. 14 Days Full Access</div>
                <p className="text-muted-foreground">Explore all premium features with no restrictions.</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">3. Add Payment Later</div>
                <p className="text-muted-foreground">Add your payment method before trial ends to continue.</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>All plans include secure data storage, regular backups, and 99.9% uptime SLA.</p>
            <p className="mt-2">
              Need a custom plan for your enterprise?{' '}
              <a href="mailto:sales@smarthvacanalytics.com" className="text-primary hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
