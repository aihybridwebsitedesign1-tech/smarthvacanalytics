'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, Loader2, RefreshCw, AlertTriangle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPlanDisplayName, canExportReports, getMaxTechnicians } from '@/lib/plan-features';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { differenceInDays } from 'date-fns';
import { checkBillingStatus, getRenewalDate } from '@/lib/billing-utils';
import { BillingAlertBanner } from '@/components/dashboard/billing-alert-banner';
import { regenerateAllSnapshots } from '@/lib/kpi-calculations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resettingAnalytics, setResettingAnalytics] = useState(false);
  const [companyName, setCompanyName] = useState(profile?.company_name || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const client: any = supabase;
      const { error } = await client
        .from('profiles')
        .update({ company_name: companyName })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = async (newTheme: 'light' | 'dark') => {
    if (!user) return;

    setTheme(newTheme);

    const client: any = supabase;
    await client
      .from('profiles')
      .update({ theme_preference: newTheme })
      .eq('id', user.id);

    await refreshProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleResetDemoData = async () => {
    if (!user) return;

    setResettingAnalytics(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reset-demo-data`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to reset demo data');
      }

      await refreshProfile();

      toast({
        title: 'Demo data cleared',
        description: 'Your analytics have been reset. Start tracking new data now.',
      });

      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset demo data',
        variant: 'destructive',
      });
    } finally {
      setResettingAnalytics(false);
    }
  };

  const [portalLoading, setPortalLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!user) return;

    setCancelLoading(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      await refreshProfile();

      toast({
        title: 'Subscription Cancelled',
        description: data.message || 'Your subscription has been cancelled successfully.',
      });

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    if (!user) return;

    if (!profile?.stripe_customer_id) {
      handleBillingSetup();
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Failed to open billing portal';
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      const errorMsg = error.message.includes('Stripe customer')
        ? 'You need to complete billing setup first. Please click "Complete Billing Setup" to add a payment method.'
        : error.message;

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleBillingSetup = async () => {
    if (!user || !profile) return;

    setSetupLoading(true);
    try {
      const plan = PRICING_PLANS[profile.plan_tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.starter;
      const priceId = plan.stripePriceId;

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

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setSetupLoading(false);
    }
  };
  const daysLeft = profile?.trial_end_date
    ? differenceInDays(new Date(profile.trial_end_date), new Date())
    : 0;

  const billingStatus = profile ? checkBillingStatus(profile) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-heading font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {billingStatus?.needsPaymentMethod && (
        <BillingAlertBanner
          message={billingStatus.message}
          daysRemaining={billingStatus.daysRemaining}
          planTier={profile?.plan_tier || 'starter'}
          userId={user?.id || ''}
          userEmail={user?.email || ''}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your company details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-lg">
                {getPlanDisplayName(profile?.plan_tier)}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.billing_status === 'trialing' && daysLeft > 0 ? (
                  <span>{daysLeft} days left in trial</span>
                ) : profile?.billing_status === 'active' ? (
                  <span>Active subscription</span>
                ) : profile?.billing_status === 'past_due' ? (
                  <span className="text-red-600">Payment past due</span>
                ) : (
                  <span>No active subscription</span>
                )}
              </p>
            </div>
            <Badge variant={profile?.billing_status === 'active' || profile?.billing_status === 'trialing' ? 'default' : 'secondary'}>
              {profile?.plan_tier?.toUpperCase() || 'STARTER'}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Plan Features:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Technicians: {getMaxTechnicians(profile?.plan_tier) === Infinity ? 'Unlimited' : getMaxTechnicians(profile?.plan_tier)}
              </li>
              <li>
                • Analytics: {profile?.plan_tier === 'growth' || profile?.plan_tier === 'pro' ? 'Up to 1 year' : '7-30 days'}
              </li>
              <li>
                • Export Reports: {canExportReports(profile?.plan_tier) ? 'Yes' : 'No'}
              </li>
            </ul>
          </div>

          {profile?.trial_end_date && !profile?.stripe_customer_id && profile?.billing_status === 'trialing' ? (
            <>
              <div className="text-sm text-muted-foreground pt-2">
                <strong>Trial Ends:</strong> {getRenewalDate(profile.trial_end_date)}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Days Left in Trial:</strong> {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              </div>
            </>
          ) : profile?.subscription_end && profile?.stripe_customer_id && profile?.billing_status === 'active' ? (
            <>
              <div className="text-sm text-muted-foreground pt-2">
                <strong>Renewal Date:</strong> {getRenewalDate(profile.subscription_end)}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Days Until Renewal:</strong> {Math.max(0, differenceInDays(new Date(profile.subscription_end), new Date()))} days
              </div>
            </>
          ) : null}

          {billingStatus?.isInGracePeriod && (
            <div className="text-sm text-orange-600 dark:text-orange-400 pt-2 font-medium">
              ⚠️ Payment method required - {billingStatus.daysRemaining} day{billingStatus.daysRemaining === 1 ? '' : 's'} remaining
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {!profile?.stripe_customer_id ? (
                <Button
                  variant="default"
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={handleBillingSetup}
                  disabled={setupLoading}
                >
                  {setupLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" />Complete Billing Setup</>
                  )}
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" onClick={handleBillingPortal} disabled={portalLoading}>
                  {portalLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                  ) : (
                    'Manage Billing'
                  )}
                </Button>
              )}
              <Button variant="default" className="flex-1" onClick={() => router.push('/pricing')}>
                {profile?.plan_tier === 'starter' ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
            </div>

            {((profile?.billing_status === 'trialing' && !profile?.stripe_customer_id) || (profile?.billing_status === 'active' && profile?.stripe_customer_id)) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>
                    ) : (
                      (profile?.billing_status === 'trialing' && !profile?.stripe_customer_id) ? 'End Free Trial' : 'Cancel Subscription'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {(profile?.billing_status === 'trialing' && !profile?.stripe_customer_id) ? 'End Free Trial?' : 'Cancel Subscription?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      {(profile?.billing_status === 'trialing' && !profile?.stripe_customer_id) ? (
                        <>
                          <p>
                            Are you sure you want to end your free trial? Your account will be immediately cancelled.
                          </p>
                          <p className="font-medium text-foreground">
                            You will lose access to:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>All dashboard features and analytics</li>
                            <li>Job and technician tracking</li>
                            <li>Performance insights and recommendations</li>
                          </ul>
                          <p className="text-sm">
                            You can always come back and start a new subscription later.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Are you sure you want to cancel your subscription? Your access will continue until the end of your current billing period.
                          </p>
                          <p className="font-medium text-foreground">
                            After cancellation:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Access continues until {profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString() : 'end of billing period'}</li>
                            <li>No further charges will be made</li>
                            <li>You can reactivate anytime before the end date</li>
                          </ul>
                          <p className="text-sm">
                            Your data will be preserved for 30 days after cancellation.
                          </p>
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep {(profile?.billing_status === 'trialing' && !profile?.stripe_customer_id) ? 'Trial' : 'Subscription'}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="flex gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleThemeToggle('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleThemeToggle('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <CardTitle>Clear Demo Data</CardTitle>
              <CardDescription>Delete all sample data and start fresh</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium text-red-900 dark:text-red-100">
              This will permanently delete all demo/sample analytics and reset your dashboard to empty.
            </p>
            <p className="text-muted-foreground">
              All demo jobs, technicians, analytics snapshots, and recommendations will be removed.
              Your account will be reset to a clean state so you can start tracking your own real data.
            </p>
            <p className="text-muted-foreground font-medium">
              This action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={resettingAnalytics}
              >
                {resettingAnalytics ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing Demo Data...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Clear Demo Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Demo Data?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    Warning: This action cannot be undone.
                  </p>
                  <p>
                    This will permanently delete all demo/sample analytics and reset your dashboard to empty.
                  </p>
                  <p className="font-medium text-foreground">
                    The following will be deleted:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All demo jobs</li>
                    <li>All demo technicians</li>
                    <li>All analytics snapshots</li>
                    <li>All recommendations</li>
                  </ul>
                  <p className="text-sm">
                    After clearing, you can start adding your own real jobs and building genuine analytics.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetDemoData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Clear All Demo Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
