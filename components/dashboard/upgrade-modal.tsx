'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { useAuth } from '@/components/providers/auth-provider';
import { getStripe } from '@/lib/stripe-client';
import { toast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const plan = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!plan.stripePriceId) {
      toast({
        title: 'Configuration Error',
        description: 'Stripe is not configured. Please contact support.',
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
      console.error('Upgrade error:', error);
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            {feature
              ? `This feature requires a Growth or Pro plan. Upgrade now to unlock ${feature} and more.`
              : 'Unlock advanced features and grow your business with our premium plans.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{PRICING_PLANS.growth.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${PRICING_PLANS.growth.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">14-day free trial</p>
              </div>

              <ul className="space-y-2 mb-6">
                {PRICING_PLANS.growth.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleUpgrade('growth')}
                disabled={loading !== null}
              >
                {loading === 'growth' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-2 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{PRICING_PLANS.pro.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${PRICING_PLANS.pro.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">14-day free trial</p>
              </div>

              <ul className="space-y-2 mb-6">
                {PRICING_PLANS.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => handleUpgrade('pro')}
                disabled={loading !== null}
              >
                {loading === 'pro' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Button
            variant="link"
            onClick={() => router.push('/pricing')}
          >
            View all plans and features
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
