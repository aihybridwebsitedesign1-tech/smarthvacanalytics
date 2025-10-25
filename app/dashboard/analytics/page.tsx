'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedChart } from '@/components/analytics/enhanced-chart';
import { canAccessTimeRange, canExportReports } from '@/lib/plan-features';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import { Lock, Download, AlertTriangle, FileText } from 'lucide-react';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateKpisForDateRange } from '@/lib/kpi-calculations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { downloadPDFReport } from '@/lib/pdf-export-utils';

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

interface ChartData {
  date: string;
  revenue: number;
  jobs: number;
  avgHours: number;
  margin: number;
  avgJobRevenue: number;
  firstTimeFixRate: number;
  avgResponseTime: number;
  revenuePerTech: number;
  jobsPerTechPerWeek: number;
  maintenanceRate: number;
}

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '3m', label: '3 Months', days: 90 },
  { value: '6m', label: '6 Months', days: 180 },
  { value: '1y', label: '1 Year', days: 365 },
];

export default function AnalyticsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [exporting, setExporting] = useState(false);

  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      const selectedRange = TIME_RANGES.find((r) => r.value === timeRange);
      if (!selectedRange) return;

      const endDate = new Date();
      const startDate = subDays(endDate, selectedRange.days);

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

      const dataPromises = dateRange.map(async (date) => {
        const kpis = await calculateKpisForDateRange(user.id, date, date);
        return {
          date: format(date, 'MMM dd'),
          revenue: kpis.totalRevenue,
          jobs: kpis.totalJobs,
          avgHours: kpis.avgHours,
          margin: kpis.grossMargin,
          avgJobRevenue: kpis.avgJobRevenue,
          firstTimeFixRate: kpis.firstTimeFixRate,
          avgResponseTime: kpis.avgResponseTime,
          revenuePerTech: kpis.revenuePerTechnician,
          jobsPerTechPerWeek: kpis.jobsPerTechPerWeek,
          maintenanceRate: kpis.maintenanceCompletionRate,
        };
      });

      const calculatedData = await Promise.all(dataPromises);
      setChartData(calculatedData);

      setLoading(false);
    };

    fetchAnalytics();
  }, [user, timeRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const daysMap: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365
    };

    if (!profile || !canAccessTimeRange(profile.plan_tier, daysMap[range])) {
      setUpgradeFeature('Advanced Analytics');
      setShowUpgradeModal(true);
      return;
    }
    setTimeRange(range);
  };

  const handleExport = async () => {
    if (!profile || !canExportReports(profile.plan_tier)) {
      setUpgradeFeature('Report Export');
      setShowUpgradeModal(true);
      return;
    }

    if (!user) return;

    setExporting(true);

    try {
      const selectedRange = TIME_RANGES.find((r) => r.value === timeRange);
      if (!selectedRange) return;

      const endDate = new Date();
      const startDate = subDays(endDate, selectedRange.days);

      const kpiData = await calculateKpisForDateRange(user.id, startDate, endDate);

      const validChartElements = chartRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);

      const dateRangeText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;

      await downloadPDFReport(
        {
          companyName: profile?.company_name || 'HVAC KPI Tracker',
          dateRange: dateRangeText,
          kpiData,
          chartElements: validChartElements,
        },
        `hvac_kpi_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      );

      toast({
        title: 'PDF Report Generated Successfully',
        description: 'Your printable report has been downloaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const canExport = profile ? canExportReports(profile.plan_tier) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Analytics</h2>
          <p className="text-sm md:text-base text-muted-foreground">Detailed insights into your business performance</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || !canExport}
          className={`${!canExport ? 'opacity-50' : ''} w-full sm:w-auto`}
        >
          {!canExport && <Lock className="mr-2 h-4 w-4" />}
          {exporting ? (
            <>
              <FileText className="mr-2 h-4 w-4 animate-pulse" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Export Printable Report (PDF)
            </>
          )}
        </Button>
      </div>

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

      <Tabs value={timeRange} onValueChange={(v) => handleTimeRangeChange(v as TimeRange)}>
        <TabsList>
          {TIME_RANGES.map((range) => {
            const hasAccess = profile ? canAccessTimeRange(profile.plan_tier, range.days) : false;
            return (
              <TabsTrigger
                key={range.value}
                value={range.value}
                disabled={!hasAccess}
                className="relative"
              >
                {range.label}
                {!hasAccess && <Lock className="ml-1 h-3 w-3" />}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(10)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div ref={(el) => (chartRefs.current[0] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Total revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedChart
                  data={chartData}
                  dataKey="revenue"
                  type="line"
                  valueType="currency"
                  title="Revenue Trend"
                />
              </CardContent>
            </Card>
          </div>

          <div ref={(el) => (chartRefs.current[1] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Jobs Completed</CardTitle>
                <CardDescription>Number of completed jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedChart
                  data={chartData}
                  dataKey="jobs"
                  type="bar"
                  valueType="number"
                  title="Jobs Completed"
                />
              </CardContent>
            </Card>
          </div>

          <div ref={(el) => (chartRefs.current[2] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Average Hours per Job</CardTitle>
                <CardDescription>Job completion efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedChart
                  data={chartData}
                  dataKey="avgHours"
                  type="line"
                  valueType="hours"
                  color="hsl(var(--chart-2))"
                  title="Average Hours per Job"
                />
              </CardContent>
            </Card>
          </div>

          <div ref={(el) => (chartRefs.current[3] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Gross Margin</CardTitle>
                <CardDescription>Profit margin percentage</CardDescription>
              </CardHeader>
              <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="margin"
                type="line"
                valueType="percentage"
                color="hsl(var(--chart-3))"
                title="Gross Margin"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[4] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Average Job Revenue</CardTitle>
              <CardDescription>Revenue per completed job</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="avgJobRevenue"
                type="line"
                valueType="currency"
                color="hsl(var(--chart-4))"
                title="Average Job Revenue"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[5] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>First-Time Fix Rate</CardTitle>
              <CardDescription>Jobs completed without callbacks (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="firstTimeFixRate"
                type="line"
                valueType="percentage"
                color="hsl(var(--chart-5))"
                title="First-Time Fix Rate"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[6] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time</CardTitle>
              <CardDescription>Hours from scheduled to completed</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="avgResponseTime"
                type="line"
                valueType="hours"
                color="hsl(var(--chart-1))"
                title="Average Response Time"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[7] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Revenue per Technician</CardTitle>
              <CardDescription>Average revenue generated per tech</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="revenuePerTech"
                type="bar"
                valueType="currency"
                color="hsl(var(--chart-2))"
                title="Revenue per Technician"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[8] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Jobs per Tech per Week</CardTitle>
              <CardDescription>Technician productivity metric</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="jobsPerTechPerWeek"
                type="line"
                valueType="number"
                color="hsl(var(--chart-3))"
                title="Jobs per Tech per Week"
              />
            </CardContent>
          </Card>
          </div>

          <div ref={(el) => (chartRefs.current[9] = el)}>
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Completion Rate</CardTitle>
              <CardDescription>Percentage of maintenance jobs (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                dataKey="maintenanceRate"
                type="line"
                valueType="percentage"
                color="hsl(var(--chart-4))"
                title="Maintenance Completion Rate"
              />
            </CardContent>
          </Card>
          </div>
        </div>
      )}

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </div>
  );
}
