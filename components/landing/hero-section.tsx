import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="inline-block mb-4">
          <Badge variant="secondary" className="text-base px-4 py-2 font-semibold">
            🎉 Start Your 14-Day Free Trial Today - No Credit Card Required
          </Badge>
        </div>

        <h1 className="text-5xl md:text-6xl font-heading font-bold leading-tight">
          Save Time. Grow Profits.
          <br />
          <span className="text-primary">Track Every HVAC Job That Matters.</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Know exactly where your business is losing time and how to fix it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">Start Free 14-Day Trial</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-2">
          No credit card required • Full access to all features • Cancel anytime
        </p>

        <div className="grid md:grid-cols-3 gap-8 pt-12 text-left">
          <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              Spot inefficiencies instantly
            </h3>
            <p className="text-muted-foreground">
              Find where hours are wasted and optimize your team&apos;s workflow.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              Boost technician productivity
            </h3>
            <p className="text-muted-foreground">
              Real-time performance insights help your team work smarter, not harder.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              Increase revenue
            </h3>
            <p className="text-muted-foreground">
              Get actionable recommendations to scale your business profitably.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
