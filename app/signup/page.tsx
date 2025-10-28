'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlanSelector } from '@/components/signup/plan-selector';
import { signUp } from '@/lib/supabase/auth';
import { seedDemoData } from '@/lib/demo-data';
import { useToast } from '@/hooks/use-toast';
import { validateTechnicianCount } from '@/lib/plan-validation';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [planTier, setPlanTier] = useState('growth');
  const [companyName, setCompanyName] = useState('');
  const [technicianCount, setTechnicianCount] = useState('3');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const count = parseInt(technicianCount) || 0;
    if (count > 0) {
      const validation = validateTechnicianCount(planTier, count);
      setValidationError(validation.isValid ? null : validation.error || null);
    } else {
      setValidationError(null);
    }
  }, [technicianCount, planTier]);

  const handleContinueToStep2 = () => {
    if (!planTier) {
      toast({
        title: 'Please select a plan',
        description: 'Choose a plan to continue',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationError) {
      toast({
        title: 'Invalid technician count',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const authData = await signUp(
        email,
        password,
        companyName,
        parseInt(technicianCount),
        planTier
      );

      if (authData.user) {
        seedDemoData(authData.user.id).catch((seedError: any) => {
          console.error('Demo data seeding error:', seedError);
        });

        toast({
          title: 'Account Created Successfully!',
          description: 'Welcome to your 14-day free trial. Redirecting to dashboard...',
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Get Started</h1>
          <p className="text-muted-foreground">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-center">Choose Your Plan</CardTitle>
                <CardDescription className="text-center">
                  Select the plan that fits your business needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanSelector selectedPlan={planTier} onSelectPlan={setPlanTier} />
              </CardContent>
            </Card>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button onClick={handleContinueToStep2}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-center">Create Your Account</CardTitle>
              <CardDescription className="text-center">
                Tell us about your business
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Your HVAC Company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technicianCount">Number of Technicians</Label>
                  <Input
                    id="technicianCount"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={technicianCount}
                    onChange={(e) => setTechnicianCount(e.target.value)}
                    required
                    disabled={loading}
                    className={validationError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {validationError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="ml-2">
                        {validationError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardContent className="space-y-4 pt-0">
                <Button type="submit" className="w-full" disabled={loading || !!validationError}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Plans
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
