'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxTechnicians: number | null;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: '1',
    name: 'Starter',
    slug: 'starter',
    price: 49,
    maxTechnicians: 3,
    features: [
      'Up to 3 technicians',
      'Basic analytics (7d, 30d)',
      'KPI dashboard',
      'Email support',
    ],
  },
  {
    id: '2',
    name: 'Growth',
    slug: 'growth',
    price: 99,
    maxTechnicians: 10,
    features: [
      'Up to 10 technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PNG/PDF)',
      'Priority support',
    ],
  },
  {
    id: '3',
    name: 'Pro',
    slug: 'pro',
    price: 199,
    maxTechnicians: null,
    features: [
      'Unlimited technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PNG/PDF)',
      'Dedicated support',
    ],
  },
];

interface PlanSelectorProps {
  selectedPlan: string;
  onSelectPlan: (planSlug: string) => void;
}

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-lg',
            selectedPlan === plan.slug && 'ring-2 ring-primary shadow-lg'
          )}
          onClick={() => onSelectPlan(plan.slug)}
        >
          {plan.slug === 'growth' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              Popular
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-center">
                {plan.maxTechnicians
                  ? `Up to ${plan.maxTechnicians} technician${plan.maxTechnicians === 1 ? '' : 's'}`
                  : 'Unlimited technicians'}
              </p>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={selectedPlan === plan.slug ? 'default' : 'outline'}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlan(plan.slug);
              }}
            >
              {selectedPlan === plan.slug ? 'Selected' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
