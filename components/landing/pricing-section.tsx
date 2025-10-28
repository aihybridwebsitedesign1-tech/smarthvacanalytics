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
          <h2 className="text-4xl font-heading font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Choose the plan that fits your business needs.
          </p>
          <p className="text-lg font-semibold text-primary">
            All plans include a 14-day free trial • No credit card required
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular
                ? 'ring-2 ring-primary shadow-lg scale-105 relative bg-gradient-to-b from-primary/5 to-background transition-all duration-300 hover:scale-[1.07]'
                : 'hover:shadow-md transition-all duration-300'}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-3 py-1 rounded-full">
                      14-Day Free Trial
                    </span>
                  </div>
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
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
