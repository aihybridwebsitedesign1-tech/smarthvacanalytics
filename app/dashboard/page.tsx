'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TimeRangeSelector, TimeRange, TIME_RANGES } from '@/components/dashboard/time-range-selector';
import { BillingAlertBanner } from '@/components/dashboard/billing-alert-banner';
import { DollarSign, Briefcase, Clock, TrendingUp, ArrowRight, Lightbulb, Target, CheckCircle, Timer, Users, Wrench, BarChart3, Phone, AlertTriangle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateKpisForDateRange, KpiData } from '@/lib/kpi-calculations';
import { subDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkBillingStatus } from '@/lib/billing-utils';

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [previousKpiData, setPreviousKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    if (!user || !profile) {
      console.log('[Dashboard] User or profile not loaded yet, skipping checkout check');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const fromCheckout = urlParams.get('from_checkout');

    console.log('[Dashboard] Checkout check:', {
      sessionId,
      fromCheckout,
      userId: user.id,
      billingStatus: profile.billing_status,
      planTier: profile.plan_tier
    });

    const shouldAutoActivate =
      profile.billing_status === 'trialing' &&
      (profile.plan_tier === 'growth' || profile.plan_tier === 'pro');

    if (shouldAutoActivate) {
      console.log('[Dashboard] Paid plan with trialing status detected, auto-activating...');
      const activateAccount = async () => {
        try {
          const response = await fetch('/api/checkout/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });

          const result = await response.json();
          console.log('[Dashboard] Auto-activate response:', response.status, result);

          if (response.ok) {
            console.log('[Dashboard] Activation successful, refreshing profile...');
            await refreshProfile();
          }
        } catch (error) {
          console.error('[Dashboard] Error auto-activating account:', error);
        }
      };
      activateAccount();
    }

    if (sessionId || fromCheckout) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    if (!user) return;
    fetchKpiData();
  }, [user, timeRange]);

  const fetchKpiData = async () => {
    if (!user) return;

    setLoading(true);

    const selectedRange = TIME_RANGES.find((r) => r.value === timeRange);
    if (!selectedRange) return;

    const endDate = new Date();
    const startDate = subDays(endDate, selectedRange.days);

    const currentKpis = await calculateKpisForDateRange(user.id, startDate, endDate);

    const previousStartDate = subDays(startDate, selectedRange.days);
    const previousEndDate = subDays(endDate, selectedRange.days);
    const previousKpis = await calculateKpisForDateRange(user.id, previousStartDate, previousEndDate);

    setKpiData(currentKpis);
    setPreviousKpiData(previousKpis);

    if (currentKpis.avgHours > 4) {
      setInsight(`You could save ${(currentKpis.avgHours - 3.5).toFixed(1)} hours per job by improving scheduling efficiency. Consider route optimization tools.`);
    } else if (currentKpis.firstTimeFixRate < 85) {
      setInsight(`Your first-time fix rate is ${currentKpis.firstTimeFixRate.toFixed(1)}%. Consider additional diagnostic training or better equipment pre-checks to reduce callbacks.`);
    } else if (currentKpis.maintenanceCompletionRate < 20) {
      setInsight(`Only ${currentKpis.maintenanceCompletionRate.toFixed(1)}% of your jobs are maintenance-based. Consider creating maintenance packages to increase recurring revenue.`);
    } else {
      setInsight('Great work! Your KPIs are trending positively. Keep maintaining efficient workflows and excellent service quality.');
    }

    setLoading(false);
  };

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const billingStatus = profile ? checkBillingStatus(profile) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Overview</h2>
          <p className="text-sm md:text-base text-muted-foreground">Your HVAC business performance at a glance</p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {billingStatus?.isTrialing && billingStatus.daysRemaining > 0 && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="ml-2 flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-200">
                {billingStatus.message} Enjoying full access to all features!
              </p>
            </div>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/pricing">
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade Now
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {billingStatus?.needsPaymentMethod && !billingStatus.isTrialing && (
        <BillingAlertBanner
          message={billingStatus.message}
          daysRemaining={billingStatus.daysRemaining}
          planTier={profile?.plan_tier || 'starter'}
          userId={user?.id || ''}
          userEmail={user?.email || ''}
        />
      )}

      {profile?.demo_mode && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2">
            <strong>Demo Analytics:</strong> Your account currently displays demo data.{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Click here to reset analytics
            </Link>{' '}
            in Settings and start tracking your own live data.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`$${kpiData?.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}`}
          icon={DollarSign}
          tooltip="Total revenue from all completed jobs in the selected period"
          trend={previousKpiData ? calculateTrend(kpiData?.totalRevenue || 0, previousKpiData.totalRevenue) : undefined}
        />
        <KpiCard
          title="Jobs Completed"
          value={kpiData?.totalJobs || 0}
          icon={Briefcase}
          tooltip="Total number of jobs marked as completed in the selected period"
          trend={previousKpiData ? calculateTrend(kpiData?.totalJobs || 0, previousKpiData.totalJobs) : undefined}
        />
        <KpiCard
          title="Avg Hours per Job"
          value={kpiData?.avgHours.toFixed(1) || '0.0'}
          icon={Clock}
          tooltip="Average time spent on each job. Lower is better for efficiency."
          trend={previousKpiData ? calculateTrend(kpiData?.avgHours || 0, previousKpiData.avgHours) : undefined}
          invertTrend
        />
        <KpiCard
          title="Gross Margin"
          value={`${kpiData?.grossMargin.toFixed(1) || 0}%`}
          icon={TrendingUp}
          tooltip="Percentage of revenue remaining after deducting direct job costs"
          trend={previousKpiData ? calculateTrend(kpiData?.grossMargin || 0, previousKpiData.grossMargin) : undefined}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Avg Job Revenue"
          value={`$${kpiData?.avgJobRevenue.toFixed(0) || 0}`}
          icon={Target}
          tooltip="Average revenue generated per completed job"
          trend={previousKpiData ? calculateTrend(kpiData?.avgJobRevenue || 0, previousKpiData.avgJobRevenue) : undefined}
        />
        <KpiCard
          title="First-Time Fix Rate"
          value={`${kpiData?.firstTimeFixRate.toFixed(1) || 0}%`}
          icon={CheckCircle}
          tooltip="Percentage of jobs completed on the first visit without callbacks. Calculated as: Jobs without callbacks ÷ Total jobs × 100"
          trend={previousKpiData ? calculateTrend(kpiData?.firstTimeFixRate || 0, previousKpiData.firstTimeFixRate) : undefined}
        />
        <KpiCard
          title="Avg Response Time"
          value={`${kpiData?.avgResponseTime.toFixed(1) || 0}h`}
          icon={Timer}
          tooltip="Average time from job scheduling to completion"
          trend={previousKpiData ? calculateTrend(kpiData?.avgResponseTime || 0, previousKpiData.avgResponseTime) : undefined}
          invertTrend
        />
        <KpiCard
          title="Revenue per Technician"
          value={`$${kpiData?.revenuePerTechnician.toFixed(0) || 0}`}
          icon={Users}
          tooltip="Total revenue divided by number of active technicians"
          trend={previousKpiData ? calculateTrend(kpiData?.revenuePerTechnician || 0, previousKpiData.revenuePerTechnician) : undefined}
        />
        <KpiCard
          title="Jobs per Tech per Week"
          value={kpiData?.jobsPerTechPerWeek.toFixed(1) || '0.0'}
          icon={BarChart3}
          tooltip="Average number of jobs each technician completes per week"
          trend={previousKpiData ? calculateTrend(kpiData?.jobsPerTechPerWeek || 0, previousKpiData.jobsPerTechPerWeek) : undefined}
        />
        <KpiCard
          title="Maintenance Rate"
          value={`${kpiData?.maintenanceCompletionRate.toFixed(1) || 0}%`}
          icon={Wrench}
          tooltip="Percentage of jobs that are preventive maintenance"
          trend={previousKpiData ? calculateTrend(kpiData?.maintenanceCompletionRate || 0, previousKpiData.maintenanceCompletionRate) : undefined}
        />
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>AI Insights</CardTitle>
              <CardDescription className="text-base mt-2">
                {insight}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/recommendations">
              View All Recommendations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Jobs
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/technicians">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Technician Performance
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>Dive deeper into your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/dashboard/analytics">
                View Detailed Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Free Consultation
            </CardTitle>
            <CardDescription>Get expert optimization advice</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">We'll analyze your KPIs and show how to optimize your business to save time and increase profits.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/recommendations">
                Book Free Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
