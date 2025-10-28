import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for small teams',
    roi: 'Get started with essential tracking',
    features: [
      'Up to 3 technicians',
      'Basic analytics (7d, 30d)',
      'Core KPI dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: 99,
    description: 'Most popular for growing businesses',
    roi: 'Save up to 10 hrs/week with full analytics',
    popular: true,
    features: [
      'Up to 10 technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PDF/CSV)',
      'All HVAC-specific KPIs',
      'Priority support',
    ],
  },
  {
    name: 'Pro',
    price: 199,
    description: 'For established HVAC companies',
    roi: 'Maximize efficiency across unlimited teams',
    features: [
      'Unlimited technicians',
      'Advanced analytics (up to 1 year)',
      'Export reports (PDF/CSV)',
      'All HVAC-specific KPIs',
      'Dedicated support',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-full text-lg font-semibold mb-6">
            🎉 14-Day Free Trial • No Credit Card Required
          </div>
          <h2 className="text-4xl font-heading font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-2">
            Choose the plan that fits your business needs.
          </p>
          <p className="text-lg font-medium text-foreground">
            Try any plan free for 14 days. Payment starts after trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular
                ? 'ring-2 ring-primary shadow-lg scale-105 relative bg-gradient-to-b from-primary/5 to-background transition-all duration-300 hover:scale-[1.07]'
                : 'hover:shadow-md transition-all duration-300 relative'}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                  14 DAYS FREE
                </span>
              </div>
              {plan.popular && (
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg mt-3">
                  Most Popular
                </div>
              )}
              <CardHeader className={plan.popular ? '' : 'pt-8'}>
                <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground line-through mb-1">
                    First 14 days: $0
                  </div>
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                  <div className="text-xs text-muted-foreground mt-1">after trial</div>
                </div>
                <p className="text-sm font-medium text-primary pt-2">{plan.roi}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
